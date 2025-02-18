import type { ActionFunctionArgs } from "@remix-run/node";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import db from "~/db.server";
import { shopService } from "~/services/shopService.server";
import { authenticate } from "~/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const {
      shop,
      session,
      topic,
      payload,
      admin: legacyAdmin,
    } = await authenticate.webhook(request);

    console.log(
      `Received ${topic} webhook for ${shop}========================>`,
    );

    const admin = legacyAdmin as unknown as AdminApiContext;
    if (!admin) {
      throw new Response();
    }

    // Webhook requests can trigger multiple times and after an app has already been uninstalled.
    // If this webhook already ran, the session may have been deleted previously.
    if (session) {
      await db.session.deleteMany({ where: { shop } });
    }

    const shopifyShopId = String((payload as { id: number }).id);

    if (shopifyShopId) {
      await shopService.deleteShop(shopifyShopId);
    }

    return new Response();
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
