import { funnelLoader } from "@/app/actions/funnelActions";
import { useLoaderData } from "@remix-run/react";

export { funnelLoader as loader };

const FunnelPage = () => {
  const {
    data: { funnel },
  } = useLoaderData<typeof funnelLoader>();

  // const isEmptyFunnel = !funnel;
  console.log("funnel :>> ", funnel);

  return <div>Hello</div>;
};

export default FunnelPage;
