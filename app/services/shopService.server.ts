import { serializeGraphQlIds } from "@/app/utils/serializeGraphQlIds";
import type { Shop } from "@prisma/client";

import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import prisma from "~/db.server";

class ShopService {
  private requestShopData = `
    #graphql
    query {
      shop {
        id
        name
        myshopifyDomain
        contactEmail
      }
    }
  `;

  async findShopByDomain(domain: string) {
    return prisma.shop.findUnique({
      where: { domain },
    });
  }

  async getShopData(admin: AdminApiContext): Promise<{
    id: string;
    name: string;
    domain: string;
    contactEmail: string;
  } | null> {
    const res = await admin.graphql(this.requestShopData);
    const { data } = await res.json();

    return data?.shop
      ? {
          ...data.shop,
          domain: data.shop.myshopifyDomain,
        }
      : null;
  }

  /**
   * Creates or updates a shop in the database.
   * @param admin - The admin API context.
   * @returns The shop ID.
   */
  async updateShop(admin: AdminApiContext) {
    const shopData = await this.getShopData(admin);

    if (!shopData) {
      console.log("Shop data not found");
      return;
    }

    const { contactEmail, domain, id, name } = shopData;
    const shopId = serializeGraphQlIds(id);

    const shopDetails = {
      contactEmail,
      name,
      domain,
    };

    await prisma.shop.upsert({
      where: { id: shopId },
      update: shopDetails,
      create: { ...shopDetails, id: shopId },
    });
  }

  /**
   * Retrieves a shop from the database.
   * @param shopifyShopId - The Shopify shop ID.
   * @returns The shop data.
   */
  async getShop(shopifyShopId: string): Promise<Shop | null> {
    const result = await prisma.shop.findUnique({
      where: {
        id: shopifyShopId,
      },
    });
    return result;
  }

  /**
   * Deletes a shop from the database.
   * @param shopifyShopId - The Shopify shop ID.
   */
  async deleteShop(shopifyShopId: string): Promise<void> {
    const shopExists = await this.getShop(shopifyShopId);

    if (shopExists) {
      await prisma.shop.delete({ where: { id: shopifyShopId } });
    }
  }
}

export const shopService = new ShopService();
