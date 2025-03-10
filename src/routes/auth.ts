import Elysia, { t } from "elysia";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { AuthPlugin } from "../middleware/auth";
import { TOPUP_TYPE } from "@prisma/client";
export const AuthRoutes = new Elysia({
  prefix: "/api/v1",
  tags: ["Auth"],
})
  .post(
    "/auth/register",
    async ({ body, jwt, set }) => {
      const { username, password } = body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        set.status = 400;
        return { error: "Username already exists" };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });

      // Generate JWT token
      const token = await jwt.sign({ id: user.id });

      return {
        id: user.id,
        username: user.username,
        isDeveloper: user.isDeveloper,
        balance: user.balance,
        token,
      };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    },
  )
  .post(
    "/auth/login",
    async ({ body, jwt, set }) => {
      const { username, password } = body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      // Generate JWT token
      const token = await jwt.sign({ id: user.id });

      return {
        id: user.id,
        username: user.username,
        isDeveloper: user.isDeveloper,
        balance: user.balance,
        token,
      };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    },
  )
  .use(AuthPlugin)
  .get("/users/@me", async ({ auth, set }) => {
    return auth;
  })
  .get("/users/@me/orders", async ({ auth, set }) => {
    const orders = await prisma.order.findMany({
      where: {
        user_id: auth.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return orders;
  })
  .get("/users/@me/topups", async ({ auth, set }) => {
    const topups = await prisma.user_topup.findMany({
      where: {
        user_id: auth.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return topups;
  })
  .post(
    "/users/@me/topups/truewallet",
    async ({ auth, body }) => {
      const qr_blob = await fetch(
        `https://promptparse-api.vercel.app/api/truewallet/0971051957/${body.amount}?message=${encodeURIComponent(`ชำระเงินให้ sellvat ${body.amount} บาท`)}`,
      ).then((res) => res.blob());

      return qr_blob;
    },
    {
      body: t.Object({
        amount: t.Numeric({ minimum: 1, maximum: 1000 }),
      }),
    },
  )
  .post(
    "/users/@me/topups/aungpao",
    async ({ auth, body }) => {
      const amount = 10;
      return await prisma.$transaction(async (tx) => {
        // Create topup record
        await tx.user_topup.create({
          data: {
            user_id: auth.id,
            amount,
            type: TOPUP_TYPE.TRUEAUNGPAO,
          },
        });

        // Update user balance
        const updatedUser = await tx.user.update({
          where: { id: auth.id },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        return {
          success: true,
          newBalance: updatedUser.balance,
          amount,
        };
      });
    },
    {
      body: t.Object({
        url: t.String(),
      }),
    },
  );
