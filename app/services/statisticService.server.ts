import type { Statistic } from '@prisma/client';

import type { StatisticData } from '@/types/statistic.type';

import prisma from '~/db.server';

class StatisticService {
    private emptyResponse: StatisticData = {
        totalOrders: 0,
        totalRevenue: 0,
        totalDiscount: 0
    };

    async getTotalStats({ shopId }: { shopId: string }): Promise<StatisticData> {
        try {
            const response = await prisma.statistic.findFirst({
                where: { shopId }
            });

            if (!response) {
                return this.emptyResponse;
            }

            return response;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            return this.emptyResponse;
        }
    }

    async addOneToStatistic({
        shopId,
        data
    }: {
        shopId: string;
        data: Partial<StatisticData>;
    }): Promise<Statistic> {
        try {
            return await prisma.statistic.upsert({
                where: { shopId },
                update: {
                    totalOrders: { increment: data.totalOrders || 0 },
                    totalRevenue: { increment: data.totalRevenue || 0 },
                    totalDiscount: { increment: data.totalDiscount || 0 }
                },
                create: {
                    shopId,
                    totalOrders: data.totalOrders || 0,
                    totalRevenue: data.totalRevenue || 0,
                    totalDiscount: data.totalDiscount || 0
                }
            });
        } catch (error) {
            console.error('Error updating statistics:', error);
            throw new Error('Failed to update statistics');
        }
    }
}

export const statisticService = new StatisticService();
