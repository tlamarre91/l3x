import { Network, NetworkConfig } from "./Network";
import { NetworkView } from "./NetworkView";
import { Color } from "three";
import { AgentFactory } from "../agent/AgentFactory";
import { NetworkNode } from "./NetworkNode";
import { NetworkEdgeView, NetworkNodeView } from "./NetworkObjectView";

export class NetworkFactory {
  static demo() {
    const [network, networkView] = NetworkFactory.grid(4, 6);

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
    networkConfig?: Partial<NetworkConfig>,
  ): [Network, NetworkView] {
    const network = new Network("linenet", networkConfig);
    const networkView = new NetworkView(network);

    let lastNode: NetworkNode | null = null;

    for (let x = 0; x < length; x++) {
      const position = [x * 3, 0, 0] as const;
      const newNode = network.addNode();
      const newNodeView = new NetworkNodeView(newNode, position, new Color(Color.NAMES.salmon));
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
    networkConfig?: Partial<NetworkConfig> & {
      separationScale?: number
    },
  ): [Network, NetworkView] {
    const separationScale = networkConfig?.separationScale ?? 6;
    // TODO: why are non-square grids broken
    function _addUpEdge(index: number) { // TODO
      const edgeProps = {
        key: "up",
      };
      const edge = network.addEdge({ from: nodes[index], to: nodes[index - width], ...edgeProps });

      const edgeView = new NetworkEdgeView(
        edge,
        nodeViews[index],
        nodeViews[index - width],
        new Color(Color.NAMES.purple),
      );
      networkView.addEdgeView(edgeView);
    }
    function _addRightEdge(index: number) { // TODO
      const edgeProps = {
        key: "right",
      };
      const edge = network.addEdge({ from: nodes[index], to: nodes[index + 1], ...edgeProps });

      const edgeView = new NetworkEdgeView(
        edge,
        nodeViews[index],
        nodeViews[index + 1],
        new Color(Color.NAMES.purple),
      );
      networkView.addEdgeView(edgeView);
    }
    function _addDownEdge(index: number) { // TODO
      const edgeProps = {
        key: "down",
      };
      const edge = network.addEdge({ from: nodes[index], to: nodes[index + width], ...edgeProps });

      const edgeView = new NetworkEdgeView(
        edge,
        nodeViews[index],
        nodeViews[index + width],
        new Color(Color.NAMES.purple),
      );
      networkView.addEdgeView(edgeView);
    }
    function _addLeftEdge(index: number) { // TODO
      const edgeProps = {
        key: "left",
      };
      const edge = network.addEdge({ from: nodes[index], to: nodes[index - 1], ...edgeProps });

      const edgeView = new NetworkEdgeView(
        edge,
        nodeViews[index],
        nodeViews[index - 1],
        new Color(Color.NAMES.purple),
      );
      networkView.addEdgeView(edgeView);
    }

    function computeNodePosition(x: number, y: number) {
      const offset = -separationScale * height / 2;
      return [
        x * separationScale + offset,
        y * separationScale + offset,
        0
      ] as const;
    }

    const network = new Network("gridnet", networkConfig);
    const networkView = new NetworkView(network);

    const nodes = new Array<NetworkNode>();
    const nodeViews = new Array<NetworkNodeView>();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const position = computeNodePosition(x, y);
        const node = network.addNode();
        const view = new NetworkNodeView(node, position, new Color(Color.NAMES.salmon));
        console.log(`position of ${node.name}: ${position}`);

        networkView.addNetworkNodeView(node, view);
        nodes.push(node);
        nodeViews.push(view);
      }
    }

    for (let columnIndex = 0; columnIndex < width; columnIndex++) {
      for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        const index = (rowIndex * width) + columnIndex;

        if (columnIndex > 0) {
          _addLeftEdge(index);
        }

        if (columnIndex < width - 1) {
          _addRightEdge(index);
        }

        if (rowIndex > 0) {
          _addUpEdge(index);
        }

        if (rowIndex < height - 1) {
          _addDownEdge(index);
        }
      }
    }

    return [network, networkView];
  }

  static ring(_count: number): [Network, NetworkView] {
    throw new Error("not implemented");
  }
}
