import { Text, TextBlock, TextContainer, Tiles } from '@shopify/post-purchase-ui-extensions-react';

import type {
    PostPurchaseMoneyLine,
    PostPurchaseMoneySummary,
    PostPurchasePriceHeader
} from '@/types/components.type';

import { formatCurrency } from '../utils/formatters';

function PriceHeader({ discountedPrice, originalPrice, loading }: PostPurchasePriceHeader) {
    return (
        <TextContainer alignment='leading' spacing='loose'>
            <Text role='deletion' size='large'>
                {!loading && formatCurrency(originalPrice)}
            </Text>
            <Text emphasized size='large' appearance='critical'>
                {!loading && formatCurrency(discountedPrice)}
            </Text>
        </TextContainer>
    );
}

function MoneyLine({ label, amount, loading = false }: PostPurchaseMoneyLine) {
    return (
        <Tiles>
            <TextBlock size='small'>{label}</TextBlock>
            <TextContainer alignment='trailing'>
                <TextBlock emphasized size='small'>
                    {loading ? '-' : formatCurrency(amount)}
                </TextBlock>
            </TextContainer>
        </Tiles>
    );
}

function MoneySummary({ label, amount }: PostPurchaseMoneySummary) {
    return (
        <Tiles>
            <TextBlock size='medium' emphasized>
                {label}
            </TextBlock>
            <TextContainer alignment='trailing'>
                <TextBlock emphasized size='medium'>
                    {formatCurrency(amount)}
                </TextBlock>
            </TextContainer>
        </Tiles>
    );
}

export const PpComponents = Object.assign(
    {},
    {
        PriceHeader,
        MoneyLine,
        MoneySummary
    }
);
