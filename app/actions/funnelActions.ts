import { funnelService } from "@/app/services/funnelService.server";
import { shopService } from "@/app/services/shopService.server";
import { authenticate } from "@/app/shopify.server";
import type { LoaderReturnType } from "@/types/common.type";
import { FunnelActions } from "@/types/funnels.type";
import type {
  FunnelActionValidationErrors,
  FunnelExtendedByProducts,
} from "@/types/funnels.type";
import type { Funnel } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export const funnelLoader = async ({
  request,
  params,
}: LoaderFunctionArgs): LoaderReturnType<{
  funnel: FunnelExtendedByProducts;
  triggeredIds: (string | void)[];
}> => {
  const emptyFunnel = {
    name: "",
    triggerId: "",
    triggerName: "",
    offerId: "",
    offerName: "",
    discount: 0,
  };

  try {
    const {
      redirect,
      admin: { graphql },
    } = await authenticate.admin(request);

    /**
     * Get a list of all id products that are target in the Funnels List.
     * This is necessary to ensure that when creating or editing a Funnel, these products do not appear in the target list.
     * This way we avoid situations where one product can be targeted in several funnels at the same time
     */
    const triggeredIds = await funnelService.getAllFunnelsTriggerProductsIds();

    /**
     * Get funnel information
     */

    if (params.id === "new") {
      return Response.json({
        status: 200,
        data: { funnel: emptyFunnel, triggeredIds },
        error: null,
      });
    } else if (params.id && !isNaN(parseInt(params.id))) {
      const funnel = await funnelService.getFunnel({
        funnelId: parseInt(params.id),
        graphql,
      });

      console.log("funnel from loader :>> ", funnel);

      return funnel
        ? Response.json({
            status: 200,
            data: {
              funnel,
              triggeredIds,
            },
            error: null,
          })
        : redirect("/app/settings/new");
    } else {
      return redirect("/app/settings/new");
    }
  } catch (error) {
    return Response.json({
      status: 500,
      error: `${error}`,
      data: { funnel: emptyFunnel, triggeredIds: [] },
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

  let newFunnel: Funnel | null | undefined = null;

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
      newFunnel = await funnelService.updateFunnel({
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

  console.log("success ===================:>> ", newFunnel?.id);

  return redirect(
    newFunnel ? `/app/settings/${newFunnel.id}` : "/app/settings/new",
  );
}
