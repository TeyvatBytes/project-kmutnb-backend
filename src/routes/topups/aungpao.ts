import twVoucher from "@fortune-inc/tw-voucher";
import Elysia, { t } from "elysia";
import { Prisma, TOPUP_TYPE } from "@prisma/client";
import { AuthPlugin } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
export const TrueAungPaoRoute = new Elysia({
  prefix: "/api/v1/payments/truewallet-aungpao",
  tags: ["Payments"],
})
  .use(AuthPlugin)
  .post(
    "/topup",
    async ({ auth, body }) => {
      try {
        const data = await twVoucher(
          process.env["TRUEWALLET_AUNGPAO_PHONE"] || "0971051957",
          body.link,
        );

        let amount = new Prisma.Decimal(data.amount).mul(1 - 0.029);

        await prisma.user.update({
          where: {
            id: auth.id,
          },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        const topup = await prisma.user_topup.create({
          data: {
            amount: amount,
            type: TOPUP_TYPE.AUNGPAO,
            metadata: data,
            user_id: auth.id,
          },
        });

        return topup;
      } catch (e) {
        return e;
      }
    },
    {
      body: t.Object({
        link: t.String({ minLength: 34 }),
      }),
    },
  );

// {
//   amount: 10,
//   owner_full_name: "ณัฐเกียรติ ***",
//   code: "01959453dd9978bf88da665fdd597e842fk",
// }
