import type { Funnel } from "@prisma/client";

export enum FunnelActions {
  CREATE_FUNNEL = "CREATE_FUNNEL",
  UPDATE_FUNNEL = "UPDATE_FUNNEL",
  DELETE_FUNNEL = "DELETE_FUNNEL",
}

export type FunnelActionValidationErrors = Partial<
  {
    [K in keyof Funnel]: string;
  } & {
    other: string;
  }
>;

export type CreateFunnelData = Pick<
  Funnel,
  "name" | "triggerId" | "offerId" | "discount"
>;

export interface FunnerCreateActionProps {
  shopId: string;
  formData: FormData;
  errors: FunnelActionValidationErrors;
}

export interface FunnelUpdateActionProps extends FunnerCreateActionProps {
  funnelId: number;
}

export type FunnelExtendedByProducts = Funnel & {
  triggerName: string;
  offerName: string;
};
