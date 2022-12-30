import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import serveStatic from "serve-static";
import connect from "./database/database.js";
import GDPRWebhookHandlers from "./gdpr.js";
import shopify from "./shopify.js";
import {
  bookingRoutes,
  collectionRoutes,
  customerRoutes,
  notificationRoutes,
  productRoutes,
  settingRoutes,
  staffRoutes,
  staffScheduleRoutes,
  widgetRoutes,
} from "./libs/index.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

connect();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers } as any)
);

app.use("/api/widget", widgetRoutes(app));

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use("/api/admin", settingRoutes(app));
app.use("/api/admin", bookingRoutes(app));
app.use("/api/admin", customerRoutes(app));
app.use("/api/admin", productRoutes(app));
app.use("/api/admin", notificationRoutes(app));
app.use("/api/admin", collectionRoutes(app));
app.use("/api/admin", staffRoutes(app));
app.use("/api/admin", staffScheduleRoutes(app));
app.use("/api/admin", settingRoutes(app));

app.use(express.json());

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
