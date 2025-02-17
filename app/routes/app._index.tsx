import { dashboardLoader } from "@/app/actions/dashboardActions";
import { InfoCard } from "@/app/components/InfoCard";
import { InfoTooltip } from "@/app/components/InfoTooltip";
import { PageLayout } from "@/app/components/PageLayout";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ActionList, Button, InlineGrid, Popover } from "@shopify/polaris";
import { DeleteIcon, EditIcon } from "@shopify/polaris-icons";
import type { FC } from "react";
import dictionary from "~/dictionary/en.json";
import { authenticate } from "../shopify.server";

export { dashboardLoader as loader };

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
  const { funnels, total, page, limit, stats } =
    useLoaderData<typeof dashboardLoader>();

  // const isLoading =
  //   ["loading", "submitting"].includes(fetcher.state) &&
  //   fetcher.formMethod === "POST";
  // const productId = fetcher.data?.product?.id.replace(
  //   "gid://shopify/Product/",
  //   "",
  // );

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
        {dictionary.actions}
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
