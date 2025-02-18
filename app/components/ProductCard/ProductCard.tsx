import type { ProductCardType } from "@/types/components.type";
import {
  BlockStack,
  Button,
  Card,
  Grid,
  InlineError,
  Text,
} from "@shopify/polaris";
import dictionary from "~/dictionary/en.json";

export const ProductCard: ProductCardType = ({
  label,
  description,
  productId,
  productName,
  onSelect,
  onClear,
  error,
  id,
}) => (
  <>
    <Grid.Cell columnSpan={{ md: 2, lg: 2, xl: 2 }}>
      <BlockStack gap="200">
        <Text as="h2" fontWeight="medium" variant="headingLg">
          {label}
        </Text>
        <Text as="p" variant="bodyMd">
          {description}
        </Text>
      </BlockStack>
    </Grid.Cell>
    <Grid.Cell columnSpan={{ md: 3, lg: 3, xl: 3 }}>
      {productId ? (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text as="h3" variant="headingSm">
              {productName}
            </Text>
            <Button
              variant="primary"
              tone="critical"
              submit={false}
              onClick={onClear}
            >
              {dictionary.removeProduct}
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card background={error ? "bg-fill-critical-secondary" : "bg-fill"}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text as="p">
                {dictionary.pleaseSelect} {label.toLowerCase()}
              </Text>
              <Button
                variant="primary"
                tone="success"
                submit={false}
                onClick={onSelect}
              >
                {dictionary.selectProduct}
              </Button>
            </div>
          </Card>
          {error && <InlineError message={error} fieldID={id} />}
        </>
      )}
    </Grid.Cell>
  </>
);
