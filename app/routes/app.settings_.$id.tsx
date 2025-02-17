import { funnelLoader } from "@/app/actions/funnelActions";
import { useActionData, useLoaderData } from "@remix-run/react";
import dictionary from "~/dictionary/en.json";
import {
  BlockStack,
  Button,
  Card,
  Divider,
  FormLayout,
  Grid,
  InlineError,
  Layout,
  Page,
  PageActions,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
import { useState } from "react";

export { funnelLoader as loader };

const FunnelPage = () => {
  const {
    data: { funnel },
  } = useLoaderData<typeof funnelLoader>();

  const [funnelName, setFunnelName] = useState(funnel?.name || "");
  const [discountValue, setDiscountValue] = useState(
    funnel?.discount.toString() || "",
  );

  const handleTitleChange = (newValue: string) => setFunnelName(newValue);

  const handleDiscountChange = (newValue: string) => setDiscountValue(newValue);

  const errors = useActionData<typeof action>()?.errors || {};

  return (
    <Page title={funnel?.id ? "Funnel Edit" : "Funnel Create"}>
      <Layout>
        <Layout.Section>
          <FormLayout>
            <BlockStack gap="1000">
              <Divider borderColor="border" borderWidth="025" />
              <Grid
                columns={{ xs: 1, sm: 1, md: 5, lg: 5, xl: 5 }}
                gap={{
                  xs: "16px",
                  sm: "16px",
                  md: "40px",
                  lg: "40px",
                  xl: "40px",
                }}
              >
                {/* LABEL: NAME block */}
                <Grid.Cell columnSpan={{ md: 2, lg: 2, xl: 2 }}>
                  <BlockStack gap="200">
                    <Text as="h2" fontWeight="medium" variant="headingLg">
                      {dictionary.name}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {dictionary.funnelNameDescription}
                    </Text>
                  </BlockStack>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ md: 3, lg: 3, xl: 3 }}>
                  <Card>
                    <TextField
                      label={dictionary.funnelName}
                      value={funnelName}
                      onChange={handleTitleChange}
                      autoComplete="off"
                      error={errors.title}
                    />
                  </Card>
                </Grid.Cell>
                {/* LABEL: TRIGGER block */}
                <Grid.Cell columnSpan={{ md: 2, lg: 2, xl: 2 }}>
                  <BlockStack gap="200">
                    <Text as="h2" fontWeight="medium" variant="headingLg">
                      Trigger
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Choose trigger product
                    </Text>
                  </BlockStack>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ md: 3, lg: 3, xl: 3 }}>
                  {formState.triggerProductId ? (
                    <Card>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <Thumbnail
                            source={formState.triggerProductImage || ImageIcon}
                            alt={formState.triggerProductTitle}
                            size="extraSmall"
                          />
                          <Text as="h3" variant="headingSm">
                            {formState.triggerProductTitle}
                          </Text>
                        </div>
                        <Button
                          variant="primary"
                          tone="critical"
                          onClick={() =>
                            clearProductData("clear-trigger-product")
                          }
                          id="clear-trigger-product"
                          accessibilityLabel="Select Product"
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <>
                      <Card
                        background={
                          errors.triggerProductId
                            ? "bg-fill-critical-secondary"
                            : "bg-fill"
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text as="p">Please select trigger product</Text>
                          <Button
                            variant="primary"
                            tone="success"
                            onClick={() => selectProduct("trigger-product")}
                            id="trigger-product"
                            accessibilityLabel="Select Product"
                          >
                            Select
                          </Button>
                        </div>
                      </Card>
                      {errors.triggerProductId && (
                        <InlineError
                          message={errors.triggerProductId}
                          fieldID="trigger-product"
                        />
                      )}
                    </>
                  )}
                </Grid.Cell>
                {/* LABEL: OFFER block */}
                <Grid.Cell columnSpan={{ md: 2, lg: 2, xl: 2 }}>
                  <BlockStack gap="200">
                    <Text as="h2" fontWeight="medium" variant="headingLg">
                      Offer
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Choose offer product
                    </Text>
                  </BlockStack>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ md: 3, lg: 3, xl: 3 }}>
                  {formState.offerProductId ? (
                    <Card>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <Thumbnail
                            source={formState.offerProductImage || ImageIcon}
                            alt={formState.offerProductTitle}
                            size="extraSmall"
                          />
                          <Text as="h3" variant="headingSm">
                            {formState.offerProductTitle}
                          </Text>
                        </div>
                        <Button
                          variant="primary"
                          tone="critical"
                          onClick={() =>
                            clearProductData("clear-offer-product")
                          }
                          id="clear-offer-product"
                          accessibilityLabel="Select Product"
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <>
                      <Card
                        background={
                          errors.offerProductId
                            ? "bg-fill-critical-secondary"
                            : "bg-fill"
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text as="p">Please select your offered product</Text>
                          <Button
                            variant="primary"
                            tone="success"
                            onClick={() => selectProduct("offer-product")}
                            id="offer-product"
                            accessibilityLabel="Select Product"
                          >
                            Select
                          </Button>
                        </div>
                      </Card>
                      {errors.offerProductId && (
                        <InlineError
                          message={errors.offerProductId}
                          fieldID="offer-product"
                        />
                      )}
                    </>
                  )}
                </Grid.Cell>
                {/* LABEL: DISCOUNT block */}
                <Grid.Cell columnSpan={{ md: 2, lg: 2, xl: 2 }}>
                  <BlockStack gap="200">
                    <Text as="h2" fontWeight="medium" variant="headingLg">
                      Discount
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Choose discount percentage
                    </Text>
                  </BlockStack>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ md: 3, lg: 3, xl: 3 }}>
                  <Card>
                    <TextField
                      label="Select your discount"
                      type="number"
                      value={discountValue}
                      onChange={handleDiscountChange}
                      autoComplete="off"
                      min={0}
                      max={100}
                      autoSize
                      suffix="%"
                      align="left"
                    />
                  </Card>
                </Grid.Cell>
              </Grid>
              <Divider borderColor="border" borderWidth="025" />
            </BlockStack>
          </FormLayout>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Save",
              loading: isLoading,
              disabled: !isDirty || isLoading,
              onAction: handleSave,
            }}
            secondaryActions={
              funnel?.id
                ? [
                    {
                      content: "Create new funnel",
                      loading: isLoading,
                      disabled: isLoading,
                      onAction: () => navigate("/app/settings/new"),
                    },
                    {
                      content: "Cancel",
                      loading: isLoading,
                      disabled: !isDirty,
                      onAction: handleCancel,
                    },
                  ]
                : undefined
            }
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default FunnelPage;
