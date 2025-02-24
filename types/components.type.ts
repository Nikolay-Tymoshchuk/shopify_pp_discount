import type { CSSProperties, Dispatch, FC, PropsWithChildren, SetStateAction } from 'react';

import type { NavigateFunction } from '@remix-run/react';

import type { FunnelExtendedByProducts } from '@/types/funnels.type';
import type { StatisticData } from '@/types/statistic.type';

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
    content: string | number;
}

export type InfoCardType = FC<InfoCardProps>;

export interface ProductCardProps {
    label: string;
    description: string;
    productId: string;
    productName: string;
    onSelect: VoidFunction;
    onClear: VoidFunction;
    error?: string;
    id: string;
}

export type ProductCardType = FC<ProductCardProps>;

export interface ActivatorProps {
    isExpanded: boolean;
    toggleActive: VoidFunction;
}

export interface DropdownProps {
    activeId: number;
    id: number;
    toggleActive: (id: number) => void;
    navigate: NavigateFunction;
}

export interface DeleteFunnelModalProps {
    funnels: FunnelExtendedByProducts[];
    activeId: number;
}

export type AnalyticType = FC<StatisticData>;

export type EmptyActionStateType = FC<{ onAction: VoidFunction }>;

export interface FunnelControllersProps {
    page: number;
    activeId: number;
    setActiveId: Dispatch<SetStateAction<number>>;
    funnels: FunnelExtendedByProducts[];
}
export interface FunnelDataTableProps extends FunnelControllersProps {
    limit: number;
    total: number;
}

export type FunnelDataTableType = FC<FunnelDataTableProps>;

export type FunnelActivatorType = FC<ActivatorProps>;

export type FunnelDropdownActionsType = FC<DropdownProps>;

export interface PostPurchaseFormState {
    quantity: number;
    variantId: string;
    variantTitle: string;
    imageSrc: string;
    altText: string;
    maxQuantity: number | undefined;
    mainTitle: string;
}

export interface PostPurchasePriceHeader {
    discountedPrice: number;
    originalPrice: number;
    loading: boolean;
}

export interface PostPurchaseMoneySummary {
    label: string;
    amount: number;
}

export interface PostPurchaseMoneyLine extends PostPurchaseMoneySummary {
    loading?: boolean;
}
