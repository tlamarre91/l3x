import { NetworkFactory } from "@/model/network/NetworkFactory";
import { createContext } from "react";

const testNetwork = NetworkFactory.grid(5, 5);

export const NetworkContext = createContext(testNetwork);
