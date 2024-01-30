import { Network, NetworkNode } from "./Network";
import { Agent } from "../agent";
import { Positioned } from "@/model/types";
import { NetworkConditionTypes } from "./NetworkCondition";

export class NetworkFactory {
  static demo() {
    const network = NetworkFactory.grid(5, 5);

    const nodes = [...network.nodesByName.values()];

    const ZIGZAG_PROGRAM = `def start
write right $f
move $pf
write i'm
test here = $pf
write here
test here = $pf
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
    network.addAgent(agent2, nodes[1]);

    network.watchedConditions$.subscribe((conditions) => {
      console.log("CONDITIONS HAVE CHANGED!!!1")
      console.log(conditions)
    });

    network.addWatchedCondition({ type: NetworkConditionTypes.playerHasAgentInNode, node: nodes[9] });

    return network;
  }

  static grid(
    height: number,
    width: number,
  ) {
    function _addUpEdge(index: number, data: Positioned) {
      network.addEdge(data, nodes[index], nodes[index - width], "up");
    }
    function _addRightEdge(index: number, data: Positioned) {
      network.addEdge(data, nodes[index], nodes[index + 1], "right");
    }
    function _addDownEdge(index: number, data: Positioned) {
      network.addEdge(data, nodes[index], nodes[index + width], "down");
    }
    function _addLeftEdge(index: number, data: Positioned) {
      network.addEdge(data, nodes[index], nodes[index - 1], "left");
    }

    function computePosition(x: number, y: number) {
      const offset = -separationScale * height / 2;
      return {
        position: [
          x * separationScale + offset,
          y * separationScale + offset,
          0
        ]
      } as const;
    }

    const separationScale = 3;

    const network = new Network<Positioned, Positioned>("gridnet");

    const nodes = new Array<NetworkNode<Positioned, Positioned>>();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const data = computePosition(x, y);
        const node = network.addNode(data);
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

    return network;
  }
}
