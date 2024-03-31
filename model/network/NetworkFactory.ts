import { Network, NetworkNode } from "./Network";
import { NetworkNodeView, NetworkView } from "./NetworkView";
import { Color } from "three";
import { BufferStore } from "../data/BufferStore";
import { AgentFactory } from "../agent/AgentFactory";

export class NetworkFactory {
  static demo() {
    const [network, networkView] = NetworkFactory.grid(50, 50);

    const nodes = [...network.nodesByName.values()];

    for (const node of nodes) {
      const rand = Math.random();

      if (rand < 0.05) {
        const agent = AgentFactory.zigzag(`zigzag-${rand}`);
        network.addAgent(agent, node);
      }

      if (rand > 0.95) {
        const agent = AgentFactory.circle(`circle-${rand}`);
        network.addAgent(agent, node);
      }
    }

    return [network, networkView] as const;
  }

  static grid(
    height: number,
    width: number,
  ): [Network, NetworkView] {
    // TODO: why are non-square grids broken
    function _addUpEdge(index: number, data: BufferStore) { // TODO
      network.addEdge(data, nodes[index], nodes[index - width], "up");
    }
    function _addRightEdge(index: number, data: BufferStore) { // TODO
      network.addEdge(data, nodes[index], nodes[index + 1], "right");
    }
    function _addDownEdge(index: number, data: BufferStore) { // TODO
      network.addEdge(data, nodes[index], nodes[index + width], "down");
    }
    function _addLeftEdge(index: number, data: BufferStore) { // TODO
      network.addEdge(data, nodes[index], nodes[index - 1], "left");
    }

    function computePosition(x: number, y: number) {
      const offset = -separationScale * height / 2;
      return [
        x * separationScale + offset,
        y * separationScale + offset,
        0
      ] as const;
    }

    const separationScale = 3;

    const network = new Network("gridnet");
    const networkView = new NetworkView(network);

    const nodes = new Array<NetworkNode>();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const position = computePosition(x, y);
        const node = network.addNode(position);
        console.log(`position of ${node.name}: ${position}`);
        const view = new NetworkNodeView(node, position, new Color(Color.NAMES.red));

        networkView.addNetworkNodeView(node, view);
        nodes.push(node);
      }
    }

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const index = y * width + x;
        const data = computePosition(x, y);

        if (x > 0) {
          _addLeftEdge(index, data);
        }

        if (x < width - 1) {
          _addRightEdge(index, data);
        }

        if (y > 0) {
          _addUpEdge(index, data);
        }

        if (y < height - 1) {
          _addDownEdge(index, data);
        }
      }
    }

    return [network, networkView];
  }

  static ring(_count: number): [Network, NetworkView] {
    throw new Error("not implemented");
  }
}
