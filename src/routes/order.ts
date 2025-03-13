import Elysia, { t } from "elysia";
import { AuthPlugin } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export const OrderRoute = new Elysia({
  prefix: "/api/v1/orders",
  tags: ["Order"],
})
  .use(AuthPlugin)
  .get("/@me", async ({ auth, set }) => {
    const orders = await prisma.order.findMany({
      where: { user_id: auth.id },
      include: {
        shop: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  });
