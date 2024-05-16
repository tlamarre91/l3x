import { NotImplementedError } from "../errors";
import { Network } from "./Network";

// function nodeChartId(nodeId: number) {
//   return `n${nodeId}`;
// }

export function renderToMermaidChart(network: Network) {
  throw new NotImplementedError();
  // const networkState = network.dumpState();
  // const mermaidChartLines = new Array<string>();
  //
  // mermaidChartLines.push("graph LR");
  //
  // for (const node of networkState.nodes) {
  //   mermaidChartLines.push(`  ${nodeChartId(node.id)}[${node.name} (${agents} agents)]`);
  // }
  //
  // for (const edge of networkState.edges) {
  //   mermaidChartLines.push(`  ${nodeChartId(edge.from.id)} --> |${edge.name}| ${nodeChartId(edge.to.id)}`);
  // }
  //
  // return mermaidChartLines.join("\n");
}
