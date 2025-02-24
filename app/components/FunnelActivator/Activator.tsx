import { Button } from "@shopify/polaris";
import dictionary from "~/dictionary/en.json";

import type { FunnelActivatorType } from "@/types/components.type";

export const FunnelActivator: FunnelActivatorType = ({
  toggleActive,
  isExpanded,
}) => {
  return (
    <div
      style={{
        maxWidth: "fit-content",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <Button
        onClick={toggleActive}
        variant="plain"
        disclosure={isExpanded ? "up" : "down"}
      >
        {dictionary.actions}
      </Button>
    </div>
  );
};
