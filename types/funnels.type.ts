// model Funnel {
//  id            Int        @id @default(autoincrement())
//  name          String
//  shop          String
//  triggerId     String
//  triggerName   String
//  offerId       String
//  offerName     String
//  discount      Float      @default(0)
//  createdAt     DateTime   @default(now())
//  updatedAt     DateTime   @default(now()) @updatedAt

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
  shopId: number;
  formData: FormData;
  errors: FunnelActionValidationErrors;
}

export interface FunnelUpdateActionProps extends FunnerCreateActionProps {
  funnelId: number;
}
