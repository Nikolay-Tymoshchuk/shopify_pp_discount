import type { PageProps } from "@shopify/polaris";
import { BlockStack, Divider, Page } from "@shopify/polaris";

import type { FC } from "react";

export const PageLayout: FC<PageProps> = ({ children, ...rest }) => {
  return (
    <Page {...rest}>
      <BlockStack gap="500">
        <Divider borderWidth="025" borderColor="border" />
        {children}
      </BlockStack>
    </Page>
  );
};
