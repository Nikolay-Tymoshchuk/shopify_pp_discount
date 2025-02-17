import { funnelService } from "@/app/services/funnelService.server";
import { authenticate } from "@/app/shopify.server";
import type { LoaderReturnType } from "@/types/common.type";
import type { Funnel } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";

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
