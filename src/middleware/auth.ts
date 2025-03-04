import Elysia from "elysia";
import { prisma } from "../lib/prisma";

export const AuthPlugin = (app: Elysia) =>
  app.derive(async ({ bearer, jwt, set }: any) => {
    const token = bearer;
    if (!token) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      throw new Error("Invalid token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      set.status = 401;
      throw new Error("User not found");
    }

    return { auth: user };
  });
