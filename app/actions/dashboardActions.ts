import { authenticate } from "@/app/shopify.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session, redirect } = await authenticate.admin(request);

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
  } = await getFunnels(session.shop, admin.graphql, page, limit);

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

  const stats: StatisticData = await getTotalStats(session.shop);

  return Response.json({
    funnels,
    page: currentPage,
    limit,
    total,
    stats,
  });
};
