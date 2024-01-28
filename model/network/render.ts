import { Network } from "./Network";
import { StringDeque } from "../agent/programs/AgentStateMachine";

function nodeChartId(nodeId: number) {
  return `n${nodeId}`;
}

export function renderToMermaidChart(network: Network<StringDeque, StringDeque>) {
  const networkState = network.dumpState();
  const mermaidChartLines = new Array<string>();

  mermaidChartLines.push("graph LR");

  for (const node of networkState.nodes) {
    mermaidChartLines.push(`  ${nodeChartId(node.id)}[${node.name} (${agents} agents)]`);
  }

  for (const edge of networkState.edges) {
    mermaidChartLines.push(`  ${nodeChartId(edge.from.id)} --> |${edge.name}| ${nodeChartId(edge.to.id)}`);
  }

  return mermaidChartLines.join("\n");
}
