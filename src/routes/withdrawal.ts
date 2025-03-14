import Elysia, { t } from "elysia";
import { AuthPlugin, developerGuardPlugin } from "../middleware/auth";
import { shopPlugin } from "../middleware/shop";
import { prisma } from "../lib/prisma";
import { WITHDRAWAL_STATUS } from "@prisma/client";

export const WithdrawalRoute = new Elysia({
  prefix: "/api/v1/withdrawals",
  tags: ["Withdrawal"],
})
  .use(AuthPlugin)
  .use(developerGuardPlugin)
  .get(
    "/",
    async ({ auth, query }) => {
      return prisma.shop_withdrawal.findMany({
        where: {
          status: query.status,
        },
        take: query.limit,
        orderBy: {
          createdAt: "desc",
        },
      });
    },
    {
      query: t.Object({
        status: t.Optional(t.Enum(WITHDRAWAL_STATUS)),
        limit: t.Numeric({ default: 100 }),
      }),
    },
  )

  .get(
    "/:withdrawal_id",
    async ({ auth, params }) => {
      return prisma.shop_withdrawal.findUnique({
        where: {
          id: params.withdrawal_id,
        },
      });
    },
    {
      params: t.Object({
        withdrawal_id: t.Numeric(),
      }),
    },
  )
  .post(
    "/:withdrawal_id/assign",
    async ({ auth, params }) => {
      const withdrawal = await prisma.shop_withdrawal.findUnique({
        where: {
          id: params.withdrawal_id,
        },
      });
      if (!withdrawal) throw new Error("Withdrawal not found");

      if (withdrawal?.manage_user_id)
        throw new Error("Withdrawal already assigned");

      return await prisma.shop_withdrawal.update({
        where: {
          id: withdrawal.id,
        },
        data: {
          manage_user_id: auth.id,
        },
      });
    },
    {
      params: t.Object({
        withdrawal_id: t.Numeric(),
      }),
    },
  )
  .put(
    "/:withdrawal_id/status",
    async ({ auth, params, body }) => {
      const withdrawal = await prisma.shop_withdrawal.findUnique({
        where: {
          id: params.withdrawal_id,
        },
      });
      if (!withdrawal) throw new Error("Withdrawal not found");

      if (withdrawal?.manage_user_id !== auth.id)
        throw new Error("This Withdrawal is managed by another user");

      return await prisma.shop_withdrawal.update({
        where: {
          id: withdrawal.id,
        },
        data: {
          status: body.status,
        },
      });
    },
    {
      params: t.Object({
        withdrawal_id: t.Numeric(),
      }),
      body: t.Object({
        status: t.Enum(WITHDRAWAL_STATUS),
      }),
    },
  );
