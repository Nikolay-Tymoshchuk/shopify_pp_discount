import { Icon, Tooltip } from "@shopify/polaris";
import { InfoIcon } from "@shopify/polaris-icons";

import type { InfoTooltipType } from "@/types/components.type";

export const InfoTooltip: InfoTooltipType = ({ content = "", style = {} }) => {
  return (
    <div style={{ ...style }}>
      <Tooltip content={content}>
        <Icon source={InfoIcon} tone="base" />
      </Tooltip>
    </div>
  );
};
