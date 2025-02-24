import { ActionList, Popover } from '@shopify/polaris';
import { DeleteIcon, EditIcon } from '@shopify/polaris-icons';

import { FunnelActivator } from '@/app/components/FunnelActivator';
import type { FunnelDropdownActionsType } from '@/types/components.type';

import dictionary from '~/dictionary/en.json';

export const FunnelDropdownActions: FunnelDropdownActionsType = ({
    id,
    activeId,
    toggleActive,
    navigate
}) => {
    const isExpanded = activeId === id;

    return (
        <Popover
            active={isExpanded}
            activator={
                <FunnelActivator isExpanded={isExpanded} toggleActive={() => toggleActive(id)} />
            }
            autofocusTarget='first-node'
            onClose={() => toggleActive(id)}
            preferredAlignment='left'>
            <ActionList
                actionRole='menuitem'
                sections={[
                    {
                        title: dictionary.fileOptions,
                        items: [
                            {
                                content: dictionary.editFunnel,
                                icon: EditIcon,
                                onAction: () => navigate(`funnels/${id}`)
                            },
                            {
                                destructive: true,
                                content: dictionary.deleteFunnel,
                                icon: DeleteIcon,
                                onAction: () => {
                                    const modalElement = document.getElementById(
                                        'delete-funnel-modal'
                                    ) as UIModalElement;
                                    if (modalElement) {
                                        modalElement.show();
                                    }
                                }
                            }
                        ]
                    }
                ]}
            />
        </Popover>
    );
};
