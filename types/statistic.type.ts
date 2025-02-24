import type { Statistic } from "@prisma/client";

export type StatisticData = Pick<
  Statistic,
  "totalDiscount" | "totalOrders" | "totalRevenue"
>;
