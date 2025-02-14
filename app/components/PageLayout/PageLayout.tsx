import { BlockStack, Divider, Page } from "@shopify/polaris";

import { InfoTooltip } from "@/app/components/InfoTooltip";

import type { PageLayoutType } from "@/types/components.type";

export const PageLayout: PageLayoutType = ({
  title,
  children,
  tooltipData,
}) => {
  return (
    <Page
      title={title}
      titleMetadata={
        tooltipData ? (
          <InfoTooltip
            content={tooltipData.content}
            style={tooltipData.style}
          />
        ) : null
      }
    >
      <BlockStack gap="500">
        <Divider borderWidth="025" borderColor="border" />
        {children}
      </BlockStack>
    </Page>
  );
};
