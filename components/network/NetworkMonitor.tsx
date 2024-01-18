import React, { useContext, useMemo } from "react";

import NetworkObjectTree from "./NetworkObjectTree";
import { useFragmentId } from "@/hooks";
import { queryObjects } from "@/model/network/queryObjects";
import { GameContext } from "../game/GameContext";

export default function NetworkMonitor() {
  const { network } = useContext(GameContext);
  const fragmentId = useFragmentId();

  // useEffect(() => {
  //   mermaid.initialize({
  //     startOnLoad: false,
  //     // logLevel: "debug"
  //   });
  // }, []);

  const queriedObject = useMemo(() => {
    if (fragmentId == null || fragmentId.length === 0) {
      return;
    }

    const object = queryObjects({ fragmentId }, network);
    return object;
  }, [fragmentId]);

  // const [mermaidChart, setMermaidChart] = useState<string>();
  // const updateMermaidChart = () => {
  //   const newChart = renderToMermaidChart(network);
  //   setMermaidChart(newChart);
  // };
  //
  // useEffect(() => {
  //   if (mermaidChart == null) {
  //     console.log("no chart string");
  //     return;
  //   }
  //   const target = mermaidTarget.current;
  //
  //   if (target == null) {
  //     console.warn("no mermaid target");
  //     return;
  //   }
  //
  //   console.log("rendering");
  //   const render = async () => {
  //     const result = await mermaid.render("the-network-chart", mermaidChart, target);
  //     console.log("render result", result);
  //     target.innerHTML = result.svg;
  //   }
  //
  //   render();
  // }, [mermaidChart]);
  //
  // const mermaidTarget = useRef<HTMLDivElement>(null);
  //
  // useEffect(() => {
  //   if (renderedChart != null && mermaidTarget.current != null) {
  //     mermaidTarget.current.innerHTML = renderedChart;
  //   }
  //
  //   console.log("nothing to render", mermaidTarget.current);
  // });

  return (
    <>
      <div>{queriedObject?.name ?? "didn't find nothin"}</div>
      <NetworkObjectTree />
    </>
  );


  // return (
  //   <Flex direction="row" gap="2">
  //     <NetworkObjectTree />
  //     <Box width="100%">
  //       <Flex direction="column">
  //         {/* <NetworkEventLog />
  //         <NetworkNodeList />
  //       </Flex>
  //     </Box>
  //   </Flex>
  // );
}

