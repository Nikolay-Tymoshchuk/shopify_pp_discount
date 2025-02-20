import type {
  CreateFunnelData,
  FunnelActionValidationErrors,
  FunnelUpdateActionProps,
  FunnerCreateActionProps,
} from "@/types/funnels.type";
import type { Funnel } from "@prisma/client";
import Joi from "joi";
import prisma from "~/db.server";

class FunnelService {
  async getFunnel({
    funnelId,
    graphql,
  }: {
    funnelId: number;
    graphql: Function;
  }): Promise<Funnel | null> {
    const result = await prisma.funnel.findUnique({
      where: { id: funnelId },
    });
    return result ? this.supplementFunnel(result, graphql) : null;
  }

  async createFunnel({ shopId, formData, errors }: FunnerCreateActionProps) {
    const data = this.prepareFunnelData(formData);
    console.log("prepareFunnelData============> :>> ", data);
    if (!this.validateAndHandleErrors(data, errors)) return null;

    return await prisma.funnel.create({
      data: { ...data, shop: { connect: { id: shopId } } },
    });
  }

  async updateFunnel({
    funnelId,
    shopId,
    formData,
    errors,
  }: FunnelUpdateActionProps) {
    const data = this.prepareFunnelData(formData);
    if (!this.validateAndHandleErrors(data, errors)) return;

    const existingFunnel = await prisma.funnel.findUnique({
      where: { id: funnelId, shopId },
    });
    if (!existingFunnel) {
      errors.other = "Funnel not found";
      return;
    }

    return await prisma.funnel.update({
      where: { id: funnelId },
      data,
    });
  }

  async getFunnelList({
    shopId,
    graphql,
    page = 1,
    limit = 5,
  }: {
    shopId: string;
    graphql: Function;
    page: number;
    limit: number;
  }) {
    const total = await prisma.funnel.count({ where: { shopId } });
    const currentPage = this.calculateCurrentPage(page, limit, total);
    const skip = Math.max((currentPage - 1) * limit, 0);

    const funnels = await prisma.funnel.findMany({
      where: { shopId },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    });

    const data = await Promise.all(
      funnels.map((funnel) => this.supplementFunnel(funnel, graphql)),
    );

    return { data, total, page: currentPage, limit };
  }

  async deleteFunnel(funnelId: number, shopId: string) {
    await prisma.funnel.delete({ where: { id: funnelId, shopId } });
  }

  async supplementFunnel(funnel: Funnel, graphql: Function) {
    const response = await graphql(
      `
        query supplementFunnel($triggerProductId: ID!, $offerProductId: ID!) {
          triggerProduct: product(id: $triggerProductId) {
            id
            title
          }
          offerProduct: product(id: $offerProductId) {
            id
            title
          }
        }
      `,
      {
        variables: {
          triggerProductId: funnel.triggerId,
          offerProductId: funnel.offerId,
        },
      },
    );

    const { data } = await response.json();

    return {
      ...funnel,
      triggerName: data.triggerProduct.title,
      offerName: data.offerProduct.title,
    };
  }

  prepareFunnelData(formData: FormData) {
    return {
      name: formData.get("name")?.toString() || "",
      triggerId: formData.get("triggerId")?.toString() || "",
      offerId: formData.get("offerId")?.toString() || "",
      discount: parseFloat(formData.get("discount")?.toString() || "0"),
    };
  }

  validateAndHandleErrors(
    data: ReturnType<typeof this.prepareFunnelData>,
    errors: FunnelActionValidationErrors,
  ): data is CreateFunnelData {
    const schema = Joi.object({
      name: Joi.string().required(),
      triggerId: Joi.string().required(),
      offerId: Joi.string().required(),
      discount: Joi.number().required(),
    });

    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      error.details.forEach((detail) => {
        const key = detail.path[0] as keyof FunnelActionValidationErrors;
        errors[key] = detail.message;
      });
      return false;
    }

    return true;
  }

  calculateCurrentPage(page: number, limit: number, total: number): number {
    return total === 0 ? 1 : Math.min(page, Math.ceil(total / limit));
  }

  async getAllFunnelsTriggerProductsIds() {
    const funnels = await prisma.funnel.findMany({
      select: { triggerId: true },
    });
    return funnels.map((funnel) => funnel.triggerId.split("/").pop());
  }
}

export const funnelService = new FunnelService();
