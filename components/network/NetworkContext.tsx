import { NetworkFactory } from "@/model/network/Factory";
import { createContext } from "react";

// export type NetworkContextValue = {
//   network: Network<string, string>; // TODO: can contexts be "generic"?
// }

const testNetwork = NetworkFactory.grid(2, 2);

export const NetworkContext = createContext(testNetwork);
