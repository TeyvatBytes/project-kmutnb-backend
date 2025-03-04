import Elysia from "elysia";
import { prisma } from "../lib/prisma";

export const shopPlugin = (app: Elysia) =>
  app.derive(async ({ params }: any) => {
    const shop = await prisma.shop.findUnique({
      where: { id: params.shop_id },
    });

    if (!shop) {
      throw new Error("Shop not found");
    }

    return {
      shop,
    };
  });

export const shopOwnershipGuardPlugin = (app: Elysia) =>
  app.derive(async ({ auth, shop, set }: any) => {
    const isOwner = shop.owner_id === auth?.id || auth?.isDeveloper;

    if (!isOwner) {
      set.status = 403;
      throw new Error("You don't have permission to access this resource");
    }
    return {
      isOwner,
    };
  });
