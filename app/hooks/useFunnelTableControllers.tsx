import { useCallback, useState } from 'react';

import { useNavigate, useSearchParams } from '@remix-run/react';

import type { TableData } from '@shopify/polaris';

import { FunnelDropdownActions } from '@/app/components/FunnelDropdownActions';
import type { FunnelControllersProps } from '@/types/components.type';

export const useFunnelTableControllers = ({
    page,
    setActiveId,
    activeId,
    funnels
}: FunnelControllersProps) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const handlePaginationClick = (page: number): void => {
        searchParams.set('page', page.toString());
        setSearchParams(searchParams, {
            replace: true,
            preventScrollReset: true
        });
    };

    const onNext = () => handlePaginationClick(page + 1);
    const onPrevious = () => handlePaginationClick(page - 1);

    const handleToggleActive = (id: number) => setActiveId(id === activeId ? -1 : id);

    const initiallySortedRows: TableData[][] =
        funnels?.map((funnel) => [
            funnel.name,
            funnel.triggerName,
            funnel.offerName,
            funnel.discount,
            <FunnelDropdownActions
                key={funnel.id}
                id={funnel.id}
                activeId={activeId}
                toggleActive={handleToggleActive}
                navigate={navigate}
            />
        ]) ?? [];

    function sortCurrency(
        rows: TableData[][],
        index: number,
        direction: 'ascending' | 'descending'
    ): TableData[][] {
        return [...rows].sort((rowA, rowB) => {
            const valueA = rowA[index];
            const valueB = rowB[index];

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return direction === 'descending'
                    ? valueB.localeCompare(valueA)
                    : valueA.localeCompare(valueB);
            } else if (typeof valueA === 'number' && typeof valueB === 'number') {
                return direction === 'descending' ? valueB - valueA : valueA - valueB;
            } else {
                return 0;
            }
        });
    }

    const [sortedRows, setSortedRows] = useState<TableData[][] | null>(null);
    const rows = sortedRows ? sortedRows : initiallySortedRows;

    const handleSort = useCallback(
        (index: number, direction: 'ascending' | 'descending') =>
            setSortedRows(sortCurrency(rows, index, direction)),
        [rows]
    );

    const handleChangeLimits = (value: string) => {
        searchParams.set('limit', value);
        searchParams.set('page', '1');
        setSearchParams(searchParams, {
            replace: true,
            preventScrollReset: true
        });
    };

    return {
        sort: handleSort,
        changeLimits: handleChangeLimits,
        onNext,
        onPrevious,
        rows
    };
};
