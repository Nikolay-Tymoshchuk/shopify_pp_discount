import type { Funnel } from '@prisma/client';
import Joi from 'joi';

import type {
    CreateFunnelData,
    DeleteFunnelActionProps,
    FunnelActionValidationErrors,
    FunnelUpdateActionProps,
    FunnerCreateActionProps
} from '@/types/funnels.type';
import type { Variant } from '@/types/offer.type';

import prisma from '~/db.server';

class FunnelService {
    /* -------------------------------------------------------------------------- */
    /*       LABEL: Get funnel by its ID and supplement it with product names      */
    /* -------------------------------------------------------------------------- */

    async getFunnel({
        funnelId,
        graphql
    }: {
        funnelId: number;
        graphql: Function;
    }): Promise<Funnel | null> {
        const result = await prisma.funnel.findUnique({
            where: { id: funnelId }
        });
        return result ? this.supplementFunnel(result, graphql) : null;
    }

    /* -------------------------------------------------------------------------- */
    /*       LABEL: create a new funnel with the given shop ID and form data      */
    /* -------------------------------------------------------------------------- */

    async createFunnel({ shopId, formData, errors }: FunnerCreateActionProps) {
        const data = this.prepareFunnelData(formData);
        if (!this.validateAndHandleErrors(data, errors)) return null;

        return await prisma.funnel.create({
            data: { ...data, shop: { connect: { id: shopId } } }
        });
    }

    /* -------------------------------------------------------------------------- */
    /*               LABEL: Update the funnel by its ID and shop ID               */
    /* -------------------------------------------------------------------------- */

    async updateFunnel({ funnelId, shopId, formData, errors }: FunnelUpdateActionProps) {
        const data = this.prepareFunnelData(formData);
        if (!this.validateAndHandleErrors(data, errors)) return;

        const existingFunnel = await prisma.funnel.findUnique({
            where: { id: funnelId, shopId }
        });
        if (!existingFunnel) {
            errors.other = 'Funnel not found';
            return;
        }

        return await prisma.funnel.update({
            where: { id: funnelId },
            data
        });
    }

    /* -------------------------------------------------------------------------- */
    /*          LABEL: get the list of funnels by shop ID and pagination          */
    /* -------------------------------------------------------------------------- */

    async getFunnelList({
        shopId,
        graphql,
        page = 1,
        limit = 5
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
            orderBy: { updatedAt: 'desc' },
            skip,
            take: limit
        });

        const data = await Promise.all(
            funnels.map((funnel) => this.supplementFunnel(funnel, graphql))
        );

        return { data, total, page: currentPage, limit };
    }

    /* -------------------------------------------------------------------------- */
    /*               LABEL: Delete the funnel by its ID and shop ID               */
    /* -------------------------------------------------------------------------- */

    async deleteFunnel({ funnelId, shopId }: DeleteFunnelActionProps) {
        await prisma.funnel.delete({ where: { id: funnelId, shopId } });
    }

    /* -------------------------------------------------------------------------- */
    /*                     LABEL: Supplement funnel by products                    */
    /* -------------------------------------------------------------------------- */
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
                    offerProductId: funnel.offerId
                }
            }
        );

        const { data } = await response.json();

        return {
            ...funnel,
            triggerName: data.triggerProduct.title,
            offerName: data.offerProduct.title
        };
    }

    /* -------------------------------------------------------------------------- */
    /*     LABEL: Get funnel data from formData and prepare it for validation     */
    /* -------------------------------------------------------------------------- */
    prepareFunnelData(formData: FormData) {
        return {
            name: formData.get('name')?.toString() || '',
            triggerId: formData.get('triggerId')?.toString() || '',
            offerId: formData.get('offerId')?.toString() || '',
            discount: parseFloat(formData.get('discount')?.toString() || '0')
        };
    }

    /* -------------------------------------------------------------------------- */
    /*      LABEL: Validate the funnel data and handle the validation errors      */
    /* ---------------------------------------------------------------------------*/

    validateAndHandleErrors(
        data: ReturnType<typeof this.prepareFunnelData>,
        errors: FunnelActionValidationErrors
    ): data is CreateFunnelData {
        const schema = Joi.object({
            name: Joi.string().required(),
            triggerId: Joi.string().required(),
            offerId: Joi.string().required(),
            discount: Joi.number().required()
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

    /* -------------------------------------------------------------------------- */
    /*      LABEL: Calculate the current page based on the total and limit        */
    /* -------------------------------------------------------------------------- */

    calculateCurrentPage(page: number, limit: number, total: number): number {
        return total === 0 ? 1 : Math.min(page, Math.ceil(total / limit));
    }

    /* -------------------------------------------------------------------------- */
    /*                 LABEL: Get all funnels trigger products ids                */
    /* -------------------------------------------------------------------------- */

    async getAllFunnelsTriggerProductsIds() {
        const funnels = await prisma.funnel.findMany({
            select: { triggerId: true }
        });

        return funnels.map((funnel) => funnel.triggerId.split('/').pop());
    }

    async supplementPostPurchaseFunnel({ id, discount, offerId }: Funnel, accessToken: string) {
        async function fetchGraphQL(query: string, variables: Record<string, string>) {
            const response = await fetch(
                'https://niko-wonderwork.myshopify.com/admin/api/2024-07/graphql.json',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': accessToken
                    },
                    body: JSON.stringify({ query, variables }) // Изменено здесь
                }
            );
            return response.json();
        }

        const query = `query GetOfferProduct($productId: ID!) {
      product: product(id: $productId) {
        id
        title
        variants: variants(first: 100) {
          nodes {
            price
            id
            displayName
            image {
              height
              width
              altText
              url
            }
            title
            availableForSale
            inventoryQuantity
          }
        }
        description(truncateAt: 200)
        legacyResourceId
        featuredImage {
          url
        }
      }
    }
  `;

        const response = await fetchGraphQL(query, {
            productId: offerId
        });

        const {
            data: { product }
        } = response;

        const variantId = product.variants.nodes[0].id.split('/')[4];

        return {
            id,
            productTitle: product.title,
            discount,
            productImage: product.featuredImage,
            variants: product.variants.nodes.map((variant: Variant) => ({
                ...variant,
                id: variant.id.split('/')[4]
            })),
            changes: [
                {
                    type: 'add_variant',
                    variantId: variantId,
                    quantity: 1,
                    discount: {
                        value: discount,
                        valueType: 'percentage',
                        title: `${discount}% off`
                    }
                }
            ]
        };
    }
}

export const funnelService = new FunnelService();
