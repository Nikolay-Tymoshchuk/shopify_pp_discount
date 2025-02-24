import { type FC, useEffect, useState } from 'react';

import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';

import { Box, Spinner, Text } from '@shopify/polaris';

import { dashboardAction, dashboardLoader } from '@/app/actions/dashboardActions';
import { Analytic } from '@/app/components/Analytic';
import { EmptyFunnelsState } from '@/app/components/EmptyFunnelState';
import { FunnelDataTable } from '@/app/components/FunnelDataTable';
import { InfoTooltip } from '@/app/components/InfoTooltip';
import { PageLayout } from '@/app/components/PageLayout';
import type { DeleteFunnelModalProps } from '@/types/components.type';
import { FunnelActions, type FunnelExtendedByProducts } from '@/types/funnels.type';

import dictionary from '~/dictionary/en.json';

export { dashboardAction as action, dashboardLoader as loader };

export default function Index() {
    const {
        data: { funnels: rawFunnels, limit, page, stats, total }
    } = useLoaderData<typeof dashboardLoader>();

    const funnels = rawFunnels?.map((funnel: any) => ({
        ...funnel,
        createdAt: new Date(funnel.createdAt),
        updatedAt: new Date(funnel.updatedAt)
    }));

    const navigate = useNavigate();

    const [activeId, setActiveId] = useState<number>(-1);

    return (
        <>
            {funnels?.length ? (
                <>
                    {stats && <Analytic {...stats} />}
                    <PageLayout
                        title={dictionary.funnels}
                        titleMetadata={<InfoTooltip content={dictionary.funnelsTooltip} />}
                        secondaryActions={[
                            {
                                content: dictionary.createFunnel,
                                url: 'funnels/new'
                            }
                        ]}>
                        <FunnelDataTable
                            page={page}
                            activeId={activeId}
                            setActiveId={setActiveId}
                            funnels={funnels}
                            limit={limit}
                            total={total}
                        />
                    </PageLayout>
                    <Modal funnels={funnels} activeId={activeId} />
                </>
            ) : (
                <EmptyFunnelsState onAction={() => navigate('funnels/new')} />
            )}
        </>
    );
}

const Modal: FC<DeleteFunnelModalProps> = ({ funnels, activeId }) => {
    const fetcher = useFetcher<typeof dashboardAction>();

    /**
     * Listen for the success of the deletion of the funnel.
     * If the deletion was successful, close the modal.
     */
    useEffect(() => {
        if (fetcher?.data?.status === 200) {
            const modalElement = document.getElementById('delete-funnel-modal') as UIModalElement;
            if (modalElement) {
                modalElement.hide();
            }
        }
    }, [fetcher.data]);

    return (
        <ui-modal id='delete-funnel-modal'>
            <Box paddingBlock='1000' paddingInlineStart='400'>
                {activeId && fetcher.state === 'idle' ? (
                    <Text as='p' variant='bodyLg'>
                        Are you sure you want to delete{' '}
                        <b>{`${funnels?.find((funnel: FunnelExtendedByProducts) => funnel.id === activeId)?.name}`}</b>
                    </Text>
                ) : (
                    <Spinner accessibilityLabel='Spinner example' size='small' />
                )}
            </Box>
            <ui-title-bar title={'Delete funnel'}>
                <button
                    variant='primary'
                    tone='critical'
                    onClick={() => {
                        fetcher.submit(
                            { action: FunnelActions.DELETE_FUNNEL, id: activeId },
                            { method: 'post' }
                        );
                    }}>
                    Delete
                </button>
                <button
                    onClick={() => {
                        const modalElement = document.getElementById(
                            'delete-funnel-modal'
                        ) as UIModalElement;
                        if (modalElement) {
                            modalElement.hide();
                        }
                    }}>
                    Cancel
                </button>
            </ui-title-bar>
        </ui-modal>
    );
};
