import { NetworkNode } from "./NetworkNode";
import { NetworkEdgeView } from "./NetworkObjectView";

/**
 * Keeps track of the views of all the edges between a given pair of nodes (in either direction)
 */
export class EdgeGroupIndex {
  #map = new Map<NetworkNode, Map<NetworkNode, NetworkEdgeView[]>>();

  add(node1: NetworkNode, node2: NetworkNode, edgeView: NetworkEdgeView): NetworkEdgeView[] {
    if (node1 === node2) {
      throw new Error("nodes can't connect to themselves");
    }

    [node1, node2] = this.#nodesSortedById(node1, node2);

    return this.#presortedAdd(node1, node2, edgeView);
  }

  getEdgesBetweenNodes(node1: NetworkNode, node2: NetworkNode): NetworkEdgeView[] | undefined {
    [node1, node2] = this.#nodesSortedById(node1, node2);
    return this.#presortedGet(node1, node2);
  }

  delete(edgeView: NetworkEdgeView): boolean {
    const { from, to } = edgeView.edge

    const [node1, node2] = this.#nodesSortedById(from, to);

    return this.#presortedDelete(node1, node2, edgeView);
  }

  #nodesSortedById(node1: NetworkNode, node2: NetworkNode): [NetworkNode, NetworkNode] {
    return node1.id < node2.id ? [node1, node2] : [node2, node1];
  }

  #presortedGet(node1: NetworkNode, node2: NetworkNode): NetworkEdgeView[] | undefined {
    return this.#map.get(node1)?.get(node2);
  }

  #presortedAdd(node1: NetworkNode, node2: NetworkNode, edgeView: NetworkEdgeView): NetworkEdgeView[] {
    let nodeMap = this.#map.get(node1);

    if (nodeMap == null) {
      nodeMap = new Map();
      nodeMap.set(node2, []);
      this.#map.set(node1, nodeMap);
    }

    let edgeViewList = nodeMap.get(node2);

    if (edgeViewList == null) {
      edgeViewList = [];
      nodeMap.set(node2, edgeViewList);
    }

    if (edgeViewList.includes(edgeView)) {
      throw new Error(`already have view in group for edge ${edgeView.edge.name}`);
    }

    edgeViewList.push(edgeView);

    return edgeViewList;
  }

  #presortedDelete(node1: NetworkNode, node2: NetworkNode, edgeView: NetworkEdgeView): boolean {
    const edgeViewList = this.#presortedGet(node1, node2);

    if (edgeViewList == null) {
      return false;
    }

    const index = edgeViewList.indexOf(edgeView);

    if (index === -1) {
      return false;
    }

    edgeViewList.splice(index, 1);

    if (edgeViewList.length === 0) {
      this.#map.delete(node1);
    }

    return true;
  }
}

