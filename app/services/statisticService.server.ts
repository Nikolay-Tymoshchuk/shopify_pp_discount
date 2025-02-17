import type { StatisticData } from "@/types/statistic.type";
import type { Statistic } from "@prisma/client";
import prisma from "~/db.server";

class StatisticService {
  async getTotalStats({ shopId }: { shopId: number }): Promise<StatisticData> {
    const response = await prisma.statistic.findMany({
      where: { shopId },
    });

    const emptyResponse = {
      totalOrders: 0,
      totalRevenue: 0,
      totalDiscount: 0,
    };

    if (!response) {
      return emptyResponse;
    }

    const result = response.reduce((acc, curr) => {
      acc.totalOrders += 1;
      acc.totalRevenue += curr.totalRevenue;
      acc.totalDiscount += curr.totalDiscount;

      return acc;
    }, emptyResponse);

    return result;
  }

  async addOneToStatistic(data: Statistic) {
    const response = await prisma.statistic.create({
      data,
    });

    return response;
  }
}

export const statisticService = new StatisticService();
