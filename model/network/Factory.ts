import { Network, NetworkNode } from "./Network";
// TODO: move Buffer to types.ts or something
import { Buffer } from "../agent/programs/AgentStateMachine";
import { Agent } from "../agent";

export class NetworkFactory {
  static grid(height: number, width: number): Network<Buffer, Buffer> {
    function _addUpEdge(index: number) {
      const buffer = [];
      network.addEdge(buffer, nodes[index], nodes[index - width], "up");
    }
    function _addRightEdge(index: number) {
      const buffer = [];
      network.addEdge(buffer, nodes[index], nodes[index + 1], "right");
    }
    function _addDownEdge(index: number) {
      const buffer = [];
      network.addEdge(buffer, nodes[index], nodes[index + width], "down");
    }
    function _addLeftEdge(index: number) {
      const buffer = [];
      network.addEdge(buffer, nodes[index], nodes[index - 1], "left");
    }

    const network = new Network<Buffer, Buffer>("gridnet");

    const nodes = new Array<NetworkNode<Buffer, Buffer>>();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const buffer: Buffer = [];
        const node = network.addNode(buffer);
        nodes.push(node);
      }
    }

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const index = y * width + x;

        if (x > 0) {
          _addLeftEdge(index);
        }

        if (x < width - 1) {
          _addRightEdge(index);
        }

        if (y > 0) {
          _addUpEdge(index);
        }

        if (y < height - 1) {
          _addDownEdge(index);
        }
      }
    }


    const ZIGZAG_PROGRAM = `def start
move right
go l1

def l1
move down
go start
`;
    const agent1 = Agent.fromCode("zigzaggy", ZIGZAG_PROGRAM);
    network.addAgent(agent1, nodes[0]);

    const CIRCLE_PROGRAM = `def start
move right
move right
move right
move down
move down
move down
move left
move left
move left
move up
move up
move up
go start
`;
    const agent2 = Agent.fromCode("circleguy", CIRCLE_PROGRAM);
    network.addAgent(agent2, nodes[4]);

    return network;
  }
}
