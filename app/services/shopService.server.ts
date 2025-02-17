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

  /**
   * Creates or updates a shop in the database.
   * @param admin - The admin API context.
   * @returns The shop ID.
   */
  async createShop(admin: AdminApiContext) {
    const response = await admin.graphql(this.requestShopData);
    const result = await response.json();

    if (!result?.data?.shop) {
      throw new Error("Shop data not found");
    }

    const {
      contactEmail,
      id,
      domain,
      name,
    }: Omit<Shop, "myShopifyDomain"> & { domain: string } = result?.data?.shop;

    const shopId = serializeGraphQlIds(id);

    await prisma.shop.upsert({
      where: {
        id: shopId,
      },
      update: {
        contactEmail: contactEmail,
        name: name,
        domain,
      },
      create: {
        contactEmail: contactEmail,
        name: name,
        domain,
        id: shopId,
      },
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
}

export const shopService = new ShopService();
