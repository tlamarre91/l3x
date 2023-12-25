import { Network } from "@/model/network";
import { createContext } from "react";

// export type NetworkContextValue = {
//   network: Network<string, string>; // TODO: can contexts be "generic"?
// }

export const NetworkContext = createContext(new Network<string, string>("net"));
