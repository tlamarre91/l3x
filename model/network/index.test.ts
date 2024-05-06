import { expect, it } from "vitest";
import { Network } from ".";

it("can create network", () => {
  const name = "testnet";
  const network = new Network(name);
  expect(network.name).toEqual(name);
});

it("can't have nodes with same name", () => {
  const netName = "testnet";
  const network = new Network(netName);

  const toTry = () => {
    const name = "testnode";
    network.addNode({ name });
    network.addNode({ name });
  };

  expect(toTry).toThrowErrorMatchingInlineSnapshot("[InvalidOperationError: Network testnet already has node testnode]");
});

it("can't have edges with same key out of same node", () => {
  const netName = "testnet";
  const network = new Network(netName);

  const toTry = () => {
    const edgeKey = "testedge";

    const node1 = network.addNode();
    const node2 = network.addNode();
    const node3 = network.addNode();

    network.addEdge({ from: node1, to: node2, key: edgeKey });
    network.addEdge({ from: node1, to: node3, key: edgeKey });
  };

  expect(toTry).toThrowErrorMatchingInlineSnapshot("[InvalidOperationError: Edge already exists with key testedge from @n0 to @n2]");
});

it("can have multiple edges between the same nodes if they have different keys", () => {
  const netName = "testnet";
  const network = new Network(netName);

  const node1 = network.addNode();
  const node2 = network.addNode();

  const edge1 = network.addEdge({ from: node1, to: node2, key: "edge1" });
  const edge2 = network.addEdge({ from: node1, to: node2, key: "edge2" });

  expect(edge1).not.toEqual(edge2);
});
