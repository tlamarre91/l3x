import { NetworkFactory } from "@/model/network/Factory";
import { createContext } from "react";

const testNetwork = NetworkFactory.grid(5, 5);

export const NetworkContext = createContext(testNetwork);
