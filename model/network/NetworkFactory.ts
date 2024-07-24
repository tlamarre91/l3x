import { Network, NetworkConfig } from "./Network";
import { NetworkView } from "./NetworkView";
import { Color, Vector3 } from "three";
import { AgentFactory } from "../agent/AgentFactory";
import { NetworkNode } from "./NetworkNode";
import { NetworkEdgeView, NetworkNodeView } from "./NetworkObjectView";
import { Agent } from "../agent";

export class NetworkFactory {
  static demo() {
    const [network, networkView] = NetworkFactory.grid(7, 7);

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

    const TEST_CODE = `def start
echo hey
move left`;

    const extraGuy = Agent.fromCode("extraguy", TEST_CODE);
    network.joinAgent(extraGuy, nodes[0]);

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
    const nodeGrid = new Array<Array<NetworkNode>>();
    const nodeViewGrid = new Array<Array<NetworkNodeView>>();

    function _addUpEdge(columnIndex: number, rowIndex: number) { // TODO
      const edgeProps = {
        key: "up",
      };
      const edge = network.addEdge({ from: nodeGrid[columnIndex][rowIndex], to: nodeGrid[columnIndex][rowIndex - 1], ...edgeProps });

      const edgeView = new NetworkEdgeView(
        edge,
        nodeViewGrid[columnIndex][rowIndex],
        nodeViewGrid[columnIndex][rowIndex - 1],
        new Color(Color.NAMES.aqua),
      );
      networkView.addEdgeView(edgeView);
    }
    function _addRightEdge(columnIndex: number, rowIndex: number) { // TODO
      const edgeProps = {
        key: "right",
      };
      const edge = network.addEdge({ from: nodeGrid[columnIndex][rowIndex], to: nodeGrid[columnIndex + 1][rowIndex], ...edgeProps });

      const edgeView = new NetworkEdgeView(
        edge,
        nodeViewGrid[columnIndex][rowIndex],
        nodeViewGrid[columnIndex + 1][rowIndex],
        new Color(Color.NAMES.purple),
      );
      networkView.addEdgeView(edgeView);
    }
    function _addDownEdge(columnIndex: number, rowIndex: number) { // TODO
      const edgeProps = {
        key: "down",
      };
      const edge = network.addEdge({ from: nodeGrid[columnIndex][rowIndex], to: nodeGrid[columnIndex][rowIndex + 1], ...edgeProps });

      const edgeView = new NetworkEdgeView(
        edge,
        nodeViewGrid[columnIndex][rowIndex],
        nodeViewGrid[columnIndex][rowIndex + 1],
        new Color(Color.NAMES.orchid),
      );
      networkView.addEdgeView(edgeView);
    }
    function _addLeftEdge(columnIndex: number, rowIndex: number) { // TODO
      const edgeProps = {
        key: "left",
      };
      const edge = network.addEdge({ from: nodeGrid[columnIndex][rowIndex], to: nodeGrid[columnIndex - 1][rowIndex], ...edgeProps });

      const edgeView = new NetworkEdgeView(
        edge,
        nodeViewGrid[columnIndex][rowIndex],
        nodeViewGrid[columnIndex - 1][rowIndex],
        new Color(Color.NAMES.orange),
      );
      networkView.addEdgeView(edgeView);
    }

    function computeNodePosition(columnIndex: number, rowIndex: number) {
      const xOffset = -width * separationScale / 2;
      const yOffset = height * separationScale / 2;
      let zOffset = -10;
      zOffset += (Math.sin(columnIndex) + Math.sin(rowIndex)) * 2;
      return [
        (columnIndex * separationScale) + xOffset,
        -(rowIndex * separationScale) + yOffset,
        zOffset
      ] as const;
    }

    const network = new Network("gridnet", networkConfig);
    const networkView = new NetworkView(network);

    for (let columnIndex = 0; columnIndex < width; columnIndex++) {
      const columnNodes = new Array<NetworkNode>;
      const columnNodeViews = new Array<NetworkNodeView>;

      for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        const position = computeNodePosition(columnIndex, rowIndex);
        const node = network.addNode();
        const view = new NetworkNodeView(node, new Vector3(...position), new Color(Color.NAMES.salmon));

        networkView.addNetworkNodeView(node, view);
        columnNodes.push(node);
        columnNodeViews.push(view);
      }

      nodeGrid.push(columnNodes);
      nodeViewGrid.push(columnNodeViews);
    }

    for (let columnIndex = 0; columnIndex < width; columnIndex++) {
      for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        if (columnIndex > 0) {
          _addLeftEdge(columnIndex, rowIndex);
        }

        if (columnIndex < width - 1) {
          _addRightEdge(columnIndex, rowIndex);
        }

        if (rowIndex > 0) {
          _addUpEdge(columnIndex, rowIndex);
        }

        if (rowIndex < height - 1) {
          _addDownEdge(columnIndex, rowIndex);
        }
      }
    }

    return [network, networkView];
  }

  static ring(_count: number): [Network, NetworkView] {
    throw new Error("not implemented");
  }
}
