import { Elysia, t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { swagger } from "@elysiajs/swagger";
import jwt from "@elysiajs/jwt";
import { AuthRoutes } from "./routes/auth";
import { OrderRoute } from "./routes/order";
import { ProductRoute } from "./routes/product";
import { ShopRoutes } from "./routes/shop/shop";
import cors from "@elysiajs/cors";
import { initDemo, initDev } from "./dev";
import { ShopOrderRoute } from "./routes/shop/shop_order";
import { WithdrawalRoute } from "./routes/withdrawal";

export const app = new Elysia()
  .use(
    cors({
      maxAge: 600,
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-jwt-token",
    }),
  )
  .use(bearer())
  .use(AuthRoutes)
  .use(OrderRoute)
  .use(ProductRoute)
  .use(ShopRoutes)
  .use(ShopOrderRoute)
  .use(WithdrawalRoute)

  .use(
    swagger({
      documentation: {
        info: {
          title: "E SHOP API",
          version: "1.0.0",
        },
        tags: [
          { name: "Auth", description: "Auth" },
          { name: "Shops", description: "Shops management" },
          { name: "Orders", description: "Orders management" },
        ],

        components: {
          securitySchemes: {
            JwtAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "Enter JWT Bearer token **_only_**",
            },
          },
        },
      },

      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  )
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "connected",
    version: "1.0.0",
  }));
// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log(
    `🦊 Elysia server is running at ${app.server?.hostname}:${app.server?.port}`,
  );
  if (process.env.NODE_ENV !== "production") initDev().catch(console.error);
  initDemo().catch(console.error);
});
export type App = typeof app;
