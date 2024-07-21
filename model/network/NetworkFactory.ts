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

  // TODO: rewrite when i've made views not suck
  static line(
    length: number,
    config?: Partial<NetworkConfig>,
  ): [Network, NetworkView] {
    const network = new Network("linenet", config);
    const networkView = new NetworkView(network);

    let lastNode: NetworkNode | null = null;

    for (let x = 0; x < length; x++) {
      const position = [x * 3, 0, 0] as const;
      const newNode = network.addNode();
      const newNodeView = new NetworkNodeView(newNode, position, new Color(Color.NAMES.red));
      console.log(`position of ${newNode.name}: ${position}`);
      networkView.addNetworkNodeView(newNode, newNodeView);

      if (lastNode !== null) {
        network.addEdge({ from: lastNode, to: newNode, key: "forward" });
        network.addEdge({ from: newNode, to: lastNode, key: "back" });
      }

      lastNode = newNode;
    }

    return [network, networkView];
  }

  // TODO: rewrite when i've made views not suck
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
