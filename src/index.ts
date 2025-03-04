import { Elysia, t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { swagger } from "@elysiajs/swagger";
import jwt from "@elysiajs/jwt";
import { AuthRoutes } from "./routes/auth";
import { OrderRoute } from "./routes/order";
import { ProductRoute } from "./routes/product";
import { ShopRoutes } from "./routes/shop";

const app = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-jwt-token",
    }),
  )
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
      },
    }),
  )
  .use(bearer())
  .use(AuthRoutes)
  .use(OrderRoute)
  .use(ProductRoute)
  .use(ShopRoutes)
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
});

export type App = typeof app;
