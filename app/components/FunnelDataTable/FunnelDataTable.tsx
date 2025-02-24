import { DataTable, Pagination, Select } from '@shopify/polaris';

import { useFunnelTableControllers } from '@/app/hooks/useFunnelTableControllers';
import type { FunnelDataTableType } from '@/types/components.type';

import dictionary from '~/dictionary/en.json';

export const FunnelDataTable: FunnelDataTableType = ({
    page,
    funnels,
    limit,
    total,
    activeId,
    setActiveId
}) => {
    const { onNext, onPrevious, sort, rows, changeLimits } = useFunnelTableControllers({
        page,
        funnels,
        activeId,
        setActiveId
    });

    return (
        <>
            <DataTable
                columnContentTypes={['text', 'text', 'text', 'numeric']}
                headings={[
                    dictionary.funnelName,
                    dictionary.trigger,
                    dictionary.offer,
                    dictionary.discount,
                    ''
                ]}
                rows={rows}
                sortable={[true, true, true, true, false]}
                defaultSortDirection='descending'
                initialSortColumnIndex={0}
                onSort={sort}
                hoverable
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'end',
                    marginTop: '12px',
                    gap: '12px',
                    alignItems: 'center'
                }}>
                <Select
                    label={dictionary.itemsPerPage}
                    labelInline
                    options={[
                        { label: '2', value: '2' },
                        { label: '5', value: '5' },
                        { label: '10', value: '10' }
                    ]}
                    value={String(limit)}
                    onChange={changeLimits}
                />
                <Pagination
                    hasNext={page * limit < total}
                    hasPrevious={page > 1}
                    onPrevious={onPrevious}
                    onNext={onNext}
                    nextKeys={[39]}
                    previousKeys={[37]}
                    label={dictionary.showingFunnels
                        .replace('{start}', String(page * limit - limit + 1))
                        .replace('{end}', String(page * limit < total ? page * limit : total))
                        .replace('{total}', String(total))}
                />
            </div>
        </>
    );
};
