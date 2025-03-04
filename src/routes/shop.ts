import Elysia, { t } from "elysia";
import { prisma } from "../lib/prisma";
import { AuthPlugin } from "../middleware/auth";
import { shopOwnershipGuardPlugin, shopPlugin } from "../middleware/shop";

export const ShopRoutes = new Elysia({
  prefix: "/api/v1/shops",
  tags: ["Shop"],
})
  .use(AuthPlugin)
  .get("/", async () => {
    const shops = await prisma.shop.findMany({
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return shops;
  })
  .get(
    "/by-slug",
    async ({ query }) => {
      const shop = await prisma.shop.findFirst({
        where: { slug: query.slug },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
            },
          },
          product: true,
        },
      });

      if (!shop) {
        return { error: "Shop not found" };
      }

      return shop;
    },
    {
      query: t.Object({
        slug: t.String(),
      }),
    },
  )
  .use(shopPlugin)
  .use(shopOwnershipGuardPlugin)
  .post(
    "/",
    async ({ body, set, auth }) => {
      const { description, logo, slug } = body;

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
        },
      });

      return shop;
    },
    {
      body: t.Object({
        description: t.String(),
        logo: t.String(),
        slug: t.String(),
      }),
    },
  )
  .get(
    "/:shop_id",
    async ({ params }) => {
      const shop = await prisma.shop.findUnique({
        where: { id: params.shop_id },
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
      const shopId = params.id;

      const { description, logo, slug } = body;

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
        },
      });

      return updatedShop;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        description: t.String(),
        logo: t.String(),
        slug: t.String(),
      }),
    },
  );
