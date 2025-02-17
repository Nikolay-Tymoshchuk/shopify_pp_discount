import { funnelService } from "@/app/services/funnelService.server";
import { shopService } from "@/app/services/shopService.server";
import { authenticate } from "@/app/shopify.server";
import type { LoaderReturnType } from "@/types/common.type";
import {
  FunnelActions,
  type FunnelActionValidationErrors,
} from "@/types/funnels.type";
import type { Funnel } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export const funnelLoader = async ({
  request,
  params,
}: LoaderFunctionArgs): LoaderReturnType<{ funnel: Funnel | null }> => {
  try {
    const { redirect } = await authenticate.admin(request);

    /**
     * Get funnel information
     */

    if (params.id === "new") {
      return Response.json({
        status: 200,
        data: { funnel: null },
        error: null,
      });
    } else if (params.id && !isNaN(parseInt(params.id))) {
      const funnel = await funnelService.getFunnel({
        funnelId: parseInt(params.id),
      });

      return funnel
        ? Response.json({
            status: 200,
            data: {
              funnel,
            },
            error: null,
          })
        : redirect("/app/funnels/new");
    } else {
      return redirect("/app/funnels/new");
    }
  } catch (error) {
    return Response.json({
      status: 500,
      error: `${error}`,
      data: { funnel: null },
    });
  }
};

export async function funnelAction({ request, params }: ActionFunctionArgs) {
  const errors: FunnelActionValidationErrors = {};

  const { session, redirect } = await authenticate.admin(request);

  const shop = await shopService.findShopByDomain(session.shop);

  if (!shop) {
    errors.other = "Shop not found";
    return Response.json({ status: 404, errors });
  }

  /**
   * Get data from the form and validate it.
   * Transform numeric values from string to number in fields discount and offerProductPrice
   */
  const formData = await request.formData();

  let newFunnel: Funnel | null = null;

  const action = formData.get("action");
  switch (action) {
    case FunnelActions.CREATE_FUNNEL:
      newFunnel = await funnelService.createFunnel({
        shopId: shop.id,
        formData,
        errors,
      });
      break;
    case FunnelActions.UPDATE_FUNNEL:
      if (!params.id || isNaN(parseInt(params.id))) {
        return redirect("/app/campaigns/new");
      }
      await funnelService.updateFunnel({
        shopId: shop.id,
        funnelId: parseInt(params.id),
        formData,
        errors,
      });
      break;
    default:
      errors.other = "Action not defined";
      return Response.json({ status: 400, errors });
  }
  if (Object.keys(errors).length) {
    return Response.json({ status: 400, errors });
  }

  return redirect(
    newFunnel ? `/app/settings/${newFunnel.id}` : "/app/settings/new",
  );
}
