import type { TypedResponse } from "@remix-run/node";

export type LoaderCommonReturnDataTypes<T> = {
  status: number;
  error: string | null;
  data: T;
};

export type LoaderReturnType<T> = Promise<
  TypedResponse<LoaderCommonReturnDataTypes<T>>
>;
