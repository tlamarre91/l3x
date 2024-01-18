import React, { useContext, useMemo } from "react";

import NetworkObjectTree from "./NetworkObjectTree";
import { useFragmentId } from "@/hooks";
import { queryObjects } from "@/model/network/queryObjects";
import { GameContext } from "../game/GameContext";

// export default function NetworkMonitor() {
//   const { network, selectedObject$ } = useContext(GameContext);
//   const fragmentId = useFragmentId();
//
//   // const queriedObject = useMemo(() => {
//   //   if (fragmentId == null || fragmentId.length === 0) {
//   //     return;
//   //   }
//   //
//   //   const object = queryObjects({ fragmentId }, network);
//   //   return object;
//   // }, [fragmentId]);
//   //
//   // const objectDetails = {};
//
//   return (
//     <>
//       <div>{queriedObject?.name ?? "didn't find nothin"}</div>
//     </>
//   );
//
//
//   // return (
//   //   <Flex direction="row" gap="2">
//   //     <NetworkObjectTree />
//   //     <Box width="100%">
//   //       <Flex direction="column">
//   //         {/* <NetworkEventLog />
//   //         <NetworkNodeList />
//   //       </Flex>
//   //     </Box>
//   //   </Flex>
//   // );
// }

