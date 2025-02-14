import type { InfoCardType } from "@/types/components.type";
import { BlockStack, Card, Text } from "@shopify/polaris";

export const InfoCard: InfoCardType = ({ content, title }) => {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h4" variant="headingSm">
          {title}
        </Text>
        <Text as="p" variant="headingLg">
          {content}
        </Text>
      </BlockStack>
    </Card>
  );
};
