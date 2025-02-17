import type { Funnel } from "@prisma/client";

class FunnelService {
  /**
   * Retrieves a shop from the database.
   * @param funnelId - The ID of the funnel to retrieve.
   * @returns The funnel data.
   */
  async getFunnel({ funnelId }: { funnelId: number }): Promise<Funnel | null> {
    const result = await prisma.funnel.findUnique({
      where: {
        id: funnelId,
      },
    });
    return result;
  }
}

export const funnelService = new FunnelService();
