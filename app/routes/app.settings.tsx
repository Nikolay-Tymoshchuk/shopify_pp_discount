import { EmptyState } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import dictionary from "~/dictionary/en.json";
import type { FC } from "react";

interface EmptyQRCodeStateProps {
  onAction: () => void;
}

const EmptyQRCodeState: FC<EmptyQRCodeStateProps> = ({ onAction }) => (
  <EmptyState
    heading={dictionary.createFunnelPageTitle}
    action={{
      content: dictionary.createFunnel,
      onAction,
    }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>{dictionary.startByClicking}</p>
  </EmptyState>
);

export default function Index() {
  const navigate = useNavigate();

  return <EmptyQRCodeState onAction={() => navigate("new")} />;
}
