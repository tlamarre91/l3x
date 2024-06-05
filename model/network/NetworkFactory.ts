import { Network, NetworkConfig } from "./Network";
import { NetworkView } from "./NetworkView";
import { Color } from "three";
import { BufferStore } from "../data/BufferStore";
import { AgentFactory } from "../agent/AgentFactory";
import { NetworkNode } from "./NetworkNode";
import { NetworkNodeView } from "./NetworkObjectView";

export class NetworkFactory {
  static demo() {
    const [network, networkView] = NetworkFactory.grid(25, 25);

    const nodes = [...network.getNodes()];

    for (const node of nodes) {
      const rand = Math.random();

      if (rand < 0.05) {
        const agent = AgentFactory.zigzag(`zigzag-${rand}`);
        network.joinAgent(agent, node);
      }

      if (rand > 0.90) {
        const agent = AgentFactory.circle(`circle-${rand}`);
        network.joinAgent(agent, node);
      }
    }

    return [network, networkView] as const;
  }

  static grid(
    height: number,
    width: number,
    config?: Partial<NetworkConfig>,
  ): [Network, NetworkView] {
    // TODO: why are non-square grids broken
    function _addUpEdge(index: number, data: BufferStore) { // TODO
      const edgeProps = {
        key: "up",
        store: data
      };
      // network.addEdge(nodes[index], nodes[index - width], edgeProps, );
      network.addEdge({ from: nodes[index], to: nodes[index - width], ...edgeProps });
    }
    function _addRightEdge(index: number, data: BufferStore) { // TODO
      const edgeProps = {
        key: "right",
        store: data
      };
      network.addEdge({ from: nodes[index], to: nodes[index + 1], ...edgeProps });
    }
    function _addDownEdge(index: number, data: BufferStore) { // TODO
      const edgeProps = {
        key: "down",
        store: data
      };
      network.addEdge({ from: nodes[index], to: nodes[index + width], ...edgeProps });
    }
    function _addLeftEdge(index: number, data: BufferStore) { // TODO
      const edgeProps = {
        key: "left",
        store: data
      };
      network.addEdge({ from: nodes[index], to: nodes[index - 1], ...edgeProps });
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

    const network = new Network("gridnet", config);
    const networkView = new NetworkView(network);

    const nodes = new Array<NetworkNode>();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const position = computePosition(x, y);
        const node = network.addNode();
        const view = new NetworkNodeView(node, position, new Color(Color.NAMES.red));
        console.log(`position of ${node.name}: ${position}`);

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
