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

it("can't have edges with same name out of same node", () => {
  const netName = "testnet";
  const network = new Network(netName);

  const toTry = () => {
    const edgeName = "testedge";

    const node1 = network.addNode();
    const node2 = network.addNode();
    const node3 = network.addNode();

    network.addEdge(node1, node2, { name: edgeName });
    network.addEdge(node1, node3, { name: edgeName });
  };

  expect(toTry).toThrowErrorMatchingInlineSnapshot("[InvalidOperationError: edge with name testedge already exists out of @n0]");
});

it("can't have multiple edges between the same nodes", () => {
  const netName = "testnet";
  const network = new Network(netName);

  const toTry = () => {
    const node1 = network.addNode();
    const node2 = network.addNode();

    network.addEdge(node1, node2, { name: "edge1" });
    network.addEdge(node1, node2, { name: "edge2" });
  };
  
  expect(toTry).toThrowErrorMatchingInlineSnapshot("[InvalidOperationError: can't overwrite existing edge from @n0 to @n1]");
});
