import { Agent } from "../agent";
import { Network, NetworkEdge, NetworkNode } from "./Network";

export const FRAGMENT_ID_PREFIX_SEP = ":";

export const FragmentIdPrefixes = {
  node: "#n",
  edge: "#e",
  agent: "#a",
} as const;

export interface NetworkObjectQuery {
  fragmentId: string;
}

export function queryObjects<NodeData, EdgeData>(
  query: NetworkObjectQuery,
  network: Network<NodeData, EdgeData>
) {
  const [prefix, key] = query.fragmentId.split(FRAGMENT_ID_PREFIX_SEP);

  switch (prefix) {
  case FragmentIdPrefixes.node:
    return network.nodesByName.get(key);

  case FragmentIdPrefixes.agent:
    console.warn("TODO: make querying for agents not slow?");
    return network.agents.find((agent) => agent.name === key);

  default:
    throw new Error(`TODO: query stuff besides nodes: ${prefix}, ${key}`);
  }
}

export function makeFragmentId(object: NetworkNode | NetworkEdge | Agent) {
  const pieces = [FragmentIdPrefixes[object.type], object.name];
  const fragmentId = pieces.join(FRAGMENT_ID_PREFIX_SEP);
  return fragmentId;
}
