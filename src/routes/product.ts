import Elysia, { t } from "elysia";
import { prisma } from "../lib/prisma";
import { shopOwnershipGuardPlugin, shopPlugin } from "../middleware/shop";
import { AuthPlugin } from "../middleware/auth";

export const ProductRoute = new Elysia({
  prefix: "/api/v1/shops/:shop_id/products",
  tags: ["Product"],
})
  .use(shopPlugin)
  .get(
    "",
    async ({ params }) => {
      const products = await prisma.product.findMany({
        where: { shop_id: params.shop_id },
        include: {
          _count: {
            select: {
              product_stock: true,
            },
          },
        },
      });

      return products;
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
      }),
    },
  )

  // Get a specific product
  .get(
    "/:product_id",
    async ({ params }) => {
      const product = await prisma.product.findFirst({
        where: {
          id: params.product_id,
          shop_id: params.shop_id,
        },
        include: {
          shop: {
            select: {
              id: true,
              slug: true,
              owner: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        return { error: "Product not found" };
      }

      return product;
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
        product_id: t.Numeric(),
      }),
    },
  )

  .use(AuthPlugin)
  // Buy a product
  .post(
    "/:product_id/buy",
    async ({ params, body, shop, auth, set }) => {
      const quantity = body.quantity;

      // Check if product exists and belongs to the shop
      const product = await prisma.product.findFirst({
        where: {
          id: params.product_id,
          shop_id: params.shop_id,
        },
      });

      if (!product) {
        set.status = 404;
        return new Error("Product not found");
      }

      // Check if enough stock is available
      const availableStockCount = await prisma.product_stock.count({
        where: { productId: product.id },
      });

      if (availableStockCount < quantity) {
        set.status = 400;
        return new Error("Not enough stock available");
      }

      // Check if user has enough balance
      const totalPriceBeforeFee = product.price.mul(quantity);
      const totalPriceAfterFee = totalPriceBeforeFee.mul(1.03);

      if (auth.balance < totalPriceAfterFee) {
        set.status = 400;
        return new Error("Insufficient balance");
      }

      // Start transaction
      return await prisma.$transaction(async (tx) => {
        // Get stock items
        const stocks = await tx.product_stock.findMany({
          where: { productId: product.id },
          take: quantity,
          orderBy: { createdAt: "asc" },
        });

        // Combine stock data
        const stockData = stocks.map((stock) => stock.data).join("\n");

        // Create order
        const order = await tx.order.create({
          data: {
            user_id: auth.id,
            shop_id: shop.id,
            product_name: product.name,
            product_price: product.price,
            description: product.description,
            quantity,
            data: stockData,
            status: "SUCCESS",
            price: totalPriceAfterFee,
          },
        });

        // Delete used stock
        await tx.product_stock.deleteMany({
          where: {
            id: {
              in: stocks.map((stock) => stock.id),
            },
          },
        });

        // Update user balance
        const user = await tx.user.update({
          where: { id: auth.id },
          data: {
            balance: {
              decrement: totalPriceAfterFee,
            },
          },
        });

        if (user.balance.lt(0)) {
          throw new Error("Insufficient balance");
        }

        // Update shop balance
        await tx.shop.update({
          where: { id: shop.id },
          data: {
            balance: {
              increment: totalPriceBeforeFee,
            },
          },
        });

        return {
          orderId: order.id,
          product: product.name,
          quantity,
          price: totalPriceAfterFee,
          data: stockData,
        };
      });
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
        product_id: t.Numeric(),
      }),
      body: t.Object({
        quantity: t.Number({ default: 1, minimum: 1, maximum: 100 }),
      }),
    },
  )
  .use(shopOwnershipGuardPlugin)
  // Create a product
  .post(
    "",
    async ({ body, shop }) => {
      const { name, description, price, image, category } = body;

      const product = await prisma.product.create({
        data: {
          shop_id: shop.id,
          name,
          description,
          price,
          category,
          image,
        },
      });

      return product;
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
      }),
      body: t.Object({
        name: t.String(),
        description: t.String(),
        price: t.Number({ maximum: 1000000, minimum: 0 }),
        category: t.String(),
        image: t.String(),
      }),
    },
  )

  // Update a product
  .put(
    "/:product_id",
    async ({ params, body, set }) => {
      const product = await prisma.product.findFirst({
        where: {
          id: params.product_id,
          shop_id: params.shop_id,
        },
      });

      if (!product) {
        set.status = 404;
        return { error: "Product not found" };
      }

      const { name, description, price, image } = body;

      const updatedProduct = await prisma.product.update({
        where: { id: params.product_id },
        data: {
          name,
          description,
          image,
          price,
        },
      });

      return updatedProduct;
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
        product_id: t.Numeric(),
      }),
      body: t.Object({
        name: t.String(),
        description: t.String(),
        image: t.String(),
        price: t.Number({ maximum: 1000000, minimum: 0 }),
      }),
    },
  )

  .delete(
    "/:product_id",
    async ({ params, body, set }) => {
      const product = await prisma.product.findFirst({
        where: {
          id: params.product_id,
          shop_id: params.shop_id,
        },
      });

      if (!product) {
        set.status = 404;
        return { error: "Product not found" };
      }

      const deleted_stocks = await prisma.product_stock.deleteMany({
        where: {
          productId: params.product_id,
        },
      });
      const deleted = await prisma.product.delete({
        where: {
          id: params.product_id,
          shop_id: params.shop_id,
        },
      });

      return deleted;
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
        product_id: t.Numeric(),
      }),
    },
  )

  // Add stock to a product
  .post(
    "/:product_id/stock",
    async ({ params, body, set, auth }) => {
      // Check if product exists and belongs to the shop
      const product = await prisma.product.findFirst({
        where: {
          id: params.product_id,
          shop_id: params.shop_id,
        },
      });

      if (!product) {
        set.status = 404;
        return { error: "Product not found" };
      }

      const { stocks } = body;

      // Add each stock item
      const stockPromises = stocks.map((data) => {
        return prisma.product_stock.create({
          data: {
            productId: params.product_id,
            data,
          },
        });
      });

      const createdStocks = await Promise.all(stockPromises);

      return {
        message: `Added ${createdStocks.length} stock items`,
        count: createdStocks.length,
      };
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
        product_id: t.Numeric(),
      }),
      body: t.Object({
        stocks: t.Array(t.String()),
      }),
    },
  )

  // Get stock for a product
  .get(
    "/:product_id/stock",
    async ({ params, set }) => {
      // Check if product exists and belongs to the shop
      const product = await prisma.product.findFirst({
        where: {
          id: params.product_id,
          shop_id: params.shop_id,
        },
      });

      if (!product) {
        set.status = 404;
        return { error: "Product not found" };
      }

      // Get stock count
      const stockCount = await prisma.product_stock.count({
        where: { productId: params.product_id },
      });

      // Get available stock items
      const availableStocks = await prisma.product_stock.findMany({
        where: { productId: params.product_id },
        orderBy: { createdAt: "asc" },
      });

      return {
        productId: params.product_id,
        stockCount,
        stocks: availableStocks,
      };
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
        product_id: t.Numeric(),
      }),
    },
  )
  .post(
    "/:product_id/stock/bulk_delete",
    async ({ params, body, set }) => {
      // Check if product exists and belongs to the shop
      const product = await prisma.product.findFirst({
        where: {
          id: params.product_id,
          shop_id: params.shop_id,
        },
      });

      if (!product) {
        set.status = 404;
        return { error: "Product not found" };
      }

      // Bulk Delete stock items
      await prisma.product_stock.deleteMany({
        where: { id: { in: body.stockIds }, productId: product.id },
      });

      return {
        message: "Bulk Stock deleted successfully",
      };
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
        product_id: t.Numeric(),
      }),
      body: t.Object({
        stockIds: t.Array(t.Numeric()),
      }),
    },
  );
