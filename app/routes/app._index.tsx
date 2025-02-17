import { InfoCard } from "@/app/components/InfoCard";
import { InfoTooltip } from "@/app/components/InfoTooltip";
import { PageLayout } from "@/app/components/PageLayout";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  ActionList,
  BlockStack,
  Box,
  Card,
  Divider,
  Grid,
  InlineGrid,
  Layout,
  Page,
  Popover,
  Text,
} from "@shopify/polaris";
import { useEffect } from "react";
import dictionary from "~/dictionary/en.json";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);

  return (
    <>
      <PageLayout
        title={dictionary.dashboard}
        titleMetadata={<InfoTooltip content={dictionary.dashboardTooltip} />}
      >
        <InlineGrid
          gap="400"
          columns={{
            xs: 1,
            sm: 3,
          }}
        >
          <InfoCard title="Product" content={`$${24}`} />
          <InfoCard title="Product" content={`$${24}`} />
          <InfoCard title="Product" content={`$${24}`} />
        </InlineGrid>
      </PageLayout>
      <PageLayout
        title={dictionary.funnels}
        titleMetadata={<InfoTooltip content={dictionary.funnelsTooltip} />}
        secondaryActions={[
          {
            content: dictionary.createFunnel,
            url: "settings/new",
          },
        ]}
      ></PageLayout>
    </>
  );
}

const Analytic: FC<StatisticData> = ({
  totalRevenue,
  totalDiscount,
  totalOrders,
}) => {
  return (
    <Page
      title="Dashboard"
      titleMetadata={
        <InfoTooltip content="Here you can view your store's performance" />
      }
    >
      <BlockStack gap="800">
        <Divider borderColor="border" borderWidth="025" />
        <Layout>
          <Layout.Section>
            <Grid columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}>
              <Grid.Cell>
                <Card roundedAbove="sm">
                  <Text as="h2" fontWeight="medium" variant="headingSm">
                    Total Revenue
                  </Text>

                  <Box paddingBlockStart="200">
                    <Text as="p" variant="bodyLg" fontWeight="bold">
                      {totalRevenue ? `$${totalRevenue.toFixed(2)}` : 0}
                    </Text>
                  </Box>
                </Card>
              </Grid.Cell>
              <Grid.Cell>
                <Card roundedAbove="sm">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text as="h2" fontWeight="medium" variant="headingSm">
                      Total Discounts
                    </Text>
                    <InfoTooltip content={"Total discounts applied"} />
                  </div>

                  <Box paddingBlockStart="200">
                    <Text as="p" variant="bodyLg" fontWeight="bold">
                      {totalDiscount ? `$${totalDiscount.toFixed(2)}` : 0}
                    </Text>
                  </Box>
                </Card>
              </Grid.Cell>
              <Grid.Cell>
                <Card roundedAbove="sm">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text as="h2" fontWeight="medium" variant="headingSm">
                      Order Count
                    </Text>
                    <InfoTooltip content={"Total number of orders"} />
                  </div>

                  <Box paddingBlockStart="200">
                    <Text as="p" variant="bodyLg" fontWeight="bold">
                      {totalOrders}
                    </Text>
                  </Box>
                </Card>
              </Grid.Cell>
            </Grid>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
};

const Activator: FC<ActivatorProps> = ({ toggleActive, isExpanded }) => {
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
        Actions
      </Button>
    </div>
  );
};

const Drop: FC<DropdownProps> = ({ id, activeId, toggleActive, navigate }) => {
  const isExpanded = activeId === id;

  return (
    <Popover
      active={isExpanded}
      activator={
        <Activator
          isExpanded={isExpanded}
          toggleActive={() => toggleActive(id)}
        />
      }
      autofocusTarget="first-node"
      onClose={() => toggleActive(id)}
      key={id}
      preferredAlignment="left"
    >
      <ActionList
        actionRole="menuitem"
        sections={[
          {
            title: "File options",
            items: [
              {
                content: "Edit funnel",
                icon: EditIcon,
                onAction: () => {
                  navigate(`settings/${id}`);
                },
              },
              {
                destructive: true,
                content: "Delete funnel",
                icon: DeleteIcon,
                onAction: () => {
                  const modalElement = document.getElementById(
                    "modal",
                  ) as UIModalElement;

                  if (modalElement) {
                    modalElement.show();
                  }
                },
              },
            ],
          },
        ]}
      />
    </Popover>
  );
};
