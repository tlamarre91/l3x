import { NetworkNode } from "./NetworkNode";

export const NetworkConditionTypes = {
  playerHasAgentInNode: "playerHasAgentInNode",
} as const;

export type NetworkConditionType =
  typeof NetworkConditionTypes[keyof typeof NetworkConditionTypes];

export interface NetworkCondition {
  type: NetworkConditionType;
  node?: NetworkNode;
}
