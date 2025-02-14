import type { CSSProperties, FC, PropsWithChildren } from "react";

export interface InfoTooltipProps {
  content: string;
  style?: CSSProperties;
}

export type InfoTooltipType = FC<InfoTooltipProps>;

export interface PageLayoutProps extends PropsWithChildren {
  title: string;
  tooltipData?: InfoTooltipProps;
}

export type PageLayoutType = FC<PageLayoutProps>;

export interface InfoCardProps {
  title: string;
  content: string;
}

export type InfoCardType = FC<InfoCardProps>;
