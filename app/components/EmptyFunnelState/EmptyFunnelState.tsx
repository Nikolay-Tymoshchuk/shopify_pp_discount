import { EmptyState } from '@shopify/polaris';

import type { EmptyActionStateType } from '@/types/components.type';

import dictionary from '~/dictionary/en.json';

export const EmptyFunnelsState: EmptyActionStateType = ({ onAction }) => (
    <EmptyState
        heading={dictionary.createFunnelPageTitle}
        action={{
            content: dictionary.createFunnel,
            onAction
        }}
        image='https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'>
        <p>{dictionary.startByClicking}</p>
    </EmptyState>
);
