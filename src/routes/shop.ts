import Elysia, { t } from "elysia";
import { prisma } from "../lib/prisma";
import { AuthPlugin } from "../middleware/auth";
import { shopOwnershipGuardPlugin, shopPlugin } from "../middleware/shop";

export const ShopRoutes = new Elysia({
  prefix: "/api/v1/shops",
  tags: ["Shop"],
})

  .get("/", async () => {
    const shops = await prisma.shop.findMany({
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
    });

    return shops;
  })
  .get(
    "/by-slug",
    async ({ query }) => {
      const shop = await prisma.shop.findUnique({
        where: { slug: query.slug },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
          products: {
            include: {
              _count: {
                select: {
                  orders: true,
                  product_stock: true,
                },
              },
            },
          },
        },
      });

      if (!shop) {
        return { error: "Shop not found" };
      }

      let categorys = await prisma.product.groupBy({
        where: {
          shop_id: shop.id,
        },
        by: ["category"],
      });
      return {
        ...shop,
        categorys: categorys
          .map((category) => category.category)
          .filter((_) => _),
      };
    },
    {
      query: t.Object({
        slug: t.String(),
      }),
    },
  )
  .use(AuthPlugin)
  .post(
    "/",
    async ({ body, set, auth }) => {
      const { description, logo, slug, name } = body;

      // Check if slug is already taken
      const existingShop = await prisma.shop.findFirst({
        where: { slug },
      });

      if (existingShop) {
        set.status = 400;
        return { error: "Shop slug already exists" };
      }

      const shop = await prisma.shop.create({
        data: {
          owner_id: auth.id,
          description,
          logo,
          slug,
          name,
        },
      });

      return shop;
    },
    {
      body: t.Object({
        description: t.String(),
        logo: t.String(),
        slug: t.String(),
        name: t.String(),
      }),
    },
  )

  .use(shopPlugin)
  .use(shopOwnershipGuardPlugin)
  .get(
    "/:shop_id",
    async ({ params }) => {
      const shop = await prisma.shop.findUnique({
        where: { id: params.shop_id },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: {
              orders: true,
              products: true,
            },
          },
        },
      });

      if (!shop) {
        return { error: "Shop not found" };
      }

      return shop;
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
      }),
    },
  )
  .put(
    "/:shop_id",
    async ({ params, body, set, shop }) => {
      const shopId = params.shop_id;

      const { description, logo, slug, name } = body;

      // Check if slug is already taken by another shop
      if (slug !== shop.slug) {
        const existingShop = await prisma.shop.findFirst({
          where: {
            slug,
            id: { not: shopId },
          },
        });

        if (existingShop) {
          set.status = 400;
          return { error: "Shop slug already exists" };
        }
      }

      const updatedShop = await prisma.shop.update({
        where: { id: shopId },
        data: {
          description,
          logo,
          slug,
          name,
        },
      });

      return updatedShop;
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
      }),
      body: t.Object({
        description: t.String(),
        logo: t.String(),
        slug: t.String(),
        name: t.String(),
      }),
    },
  );
