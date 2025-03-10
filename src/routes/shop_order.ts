import Elysia, { t } from "elysia";
import { AuthPlugin } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { shopOwnershipGuardPlugin, shopPlugin } from "../middleware/shop";

export const ShopOrderRoute = new Elysia({
  prefix: "/api/v1/shops/:shop_id/orders",
  tags: ["Order"],
})
  .use(AuthPlugin)
  .use(shopPlugin)
  // Get all orders for a shop (for anyone)
  .get(
    "",
    async ({ params, query }) => {
      const limit = query.limit ? parseInt(query.limit) : undefined;
      const orders = await prisma.order.findMany({
        where: { shop_id: params.shop_id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          product: true,
          shop: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      return orders;
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
      }),
      query: t.Object({
        limit: t.Optional(t.String()),
      }),
    },
  )
  // Shop owner can only get more detailed info
  .use(shopOwnershipGuardPlugin)
  // Get a specific order
  .get(
    "/:order_id",
    async ({ params }) => {
      const order = await prisma.order.findFirst({
        where: {
          id: params.order_id,
          shop_id: params.shop_id,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          product: true,
          shop: true,
        },
      });

      if (!order) {
        return { error: "Order not found" };
      }

      return order;
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
        order_id: t.Numeric(),
      }),
    },
  )
  // Update order status
  .put(
    "/:order_id/status",
    async ({ params, body, set }) => {
      const { status } = body;

      const order = await prisma.order.findFirst({
        where: {
          id: params.order_id,
          shop_id: params.shop_id,
        },
      });

      if (!order) {
        set.status = 404;
        return { error: "Order not found" };
      }

      const updatedOrder = await prisma.order.update({
        where: { id: params.order_id },
        data: { status },
      });

      return updatedOrder;
    },
    {
      params: t.Object({
        shop_id: t.Numeric(),
        order_id: t.Numeric(),
      }),
      body: t.Object({
        status: t.Enum({
          PENDING: "PENDING",
          SUCCESS: "SUCCESS",
          CANCELLED: "CANCELLED",
          CANCELLED_REFUND: "CANCELLED_REFUND",
        }),
      }),
    },
  );
