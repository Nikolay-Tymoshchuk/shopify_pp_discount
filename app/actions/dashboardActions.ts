import { funnelService } from "@/app/services/funnelService.server";
import { shopService } from "@/app/services/shopService.server";
import { statisticService } from "@/app/services/statisticService.server";
import { authenticate } from "@/app/shopify.server";
import { ApiResponse } from "@/app/utils/ApiResponse";
import { getPaginationParams } from "@/app/utils/pagination";
import type { LoaderReturnType } from "@/types/common.type";
import {
  FunnelActions,
  type FunnelActionValidationErrors,
  type FunnelExtendedByProducts,
} from "@/types/funnels.type";
import type { StatisticData } from "@/types/statistic.type";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

interface DashboardData {
  funnels: FunnelExtendedByProducts[] | null;
  stats: StatisticData | null;
  page: number;
  limit: number;
  total: number;
}

const getEmptyDashboardData = (page: number, limit: number): DashboardData => ({
  funnels: null,
  stats: null,
  page,
  limit,
  total: 0,
});

export const dashboardLoader = async ({
  request,
}: LoaderFunctionArgs): LoaderReturnType<DashboardData> => {
  const url = new URL(request.url);
  const { page, limit } = getPaginationParams(url);

  try {
    const {
      admin: { graphql },
      session,
      redirect,
    } = await authenticate.admin(request);
    const shop = await shopService.findShopByDomain(session.shop);

    if (!shop) {
      return ApiResponse.notFound(
        "Shop not found",
        getEmptyDashboardData(page, limit),
      );
    }

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

    if (currentPage !== page) {
      url.searchParams.set("page", String(currentPage));
      return redirect(url.toString());
    }

    const stats = await statisticService.getTotalStats({ shopId: shop.id });

    return ApiResponse.success({
      funnels,
      page: currentPage,
      limit,
      total,
      stats,
    });
  } catch (error) {
    console.error(error);
    return ApiResponse.error(
      500,
      "Internal server error",
      getEmptyDashboardData(page, limit),
    );
  }
};

export async function dashboardAction({ request }: ActionFunctionArgs) {
  const { session, redirect } = await authenticate.admin(request);

  const shop = await shopService.findShopByDomain(session.shop);

  if (!shop) {
    return ApiResponse.error(404, "Shop not found", null);
  }

  const formData = await request.formData();

  const action = formData.get("action");
  switch (action) {
    case FunnelActions.DELETE_FUNNEL:
      await funnelService.deleteFunnel({
        shopId: shop.id,
        funnelId: Number(formData.get("id")),
      });
      redirect("/app");
      return ApiResponse.success(null);
    default:
      return ApiResponse.error(400, "Action not defined", null);
  }
}
