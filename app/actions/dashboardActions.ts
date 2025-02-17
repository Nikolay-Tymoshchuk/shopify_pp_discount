import { funnelService } from "@/app/services/funnelService.server";
import { shopService } from "@/app/services/shopService.server";
import { statisticService } from "@/app/services/statisticService.server";
import { authenticate } from "@/app/shopify.server";
import type { StatisticData } from "@/types/statistic.type";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const dashboardLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const {
      admin: { graphql },
      session,
      redirect,
    } = await authenticate.admin(request);

    const shop = await shopService.findShopByDomain(session.shop);
    console.log("shop :>> ", shop);
    if (!shop) {
      return Response.json({
        status: 404,
        error: "Shop not found",
        data: {
          funnels: null,
          stats: null,
        },
      });
    }

    /**
     * Get List of funnels with pagination data
     */
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 5;

    const {
      data: funnels,
      total,
      page: currentPage,
    } = await funnelService.getFunnelList({
      shopId: shop.id,
      graphql,
      page,
      limit,
    });

    /**
     * From the server side we get also get page number.
     * This is necessary for the case when the user enters a page number greater than the total number of pages.
     * So we need to redirect user to the last page of the list
     * even if the user enters a page number greater than the total number of pages.
     */
    if (currentPage !== page) {
      url.searchParams.set("page", String(currentPage));
      return redirect(url.toString());
    }

    /**
     * Get statistic for analytic section from the database
     */

    const stats: StatisticData = await statisticService.getTotalStats({
      shopId: shop.id,
    });

    return Response.json({
      funnels,
      page: currentPage,
      limit,
      total,
      stats,
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      status: 500,
      error: "Internal server error",
      data: {
        funnels: null,
        stats: null,
      },
    });
  }
};
