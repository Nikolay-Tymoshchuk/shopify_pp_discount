import { InfoCard } from "@/app/components/InfoCard";
import { InfoTooltip } from "@/app/components/InfoTooltip";
import { PageLayout } from "@/app/components/PageLayout";
import type { AnalyticType } from "@/types/components.type";
import { InlineGrid } from "@shopify/polaris";
import dictionary from "~/dictionary/en.json";

export const Analytic: AnalyticType = ({
  totalRevenue,
  totalDiscount,
  totalOrders,
}) => {
  const arrayForDraw = [
    {
      title: dictionary.totalRevenue,
      value: `$${totalRevenue.toFixed(2)}`,
    },
    {
      title: dictionary.totalDiscount,
      value: `$${totalDiscount.toFixed(2)}`,
    },
    {
      title: dictionary.totalOrders,
      value: totalOrders,
    },
  ];
  return (
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
        {arrayForDraw.map((item) => (
          <InfoCard key={item.title} title={item.title} content={item.value} />
        ))}
      </InlineGrid>
    </PageLayout>
  );
};
