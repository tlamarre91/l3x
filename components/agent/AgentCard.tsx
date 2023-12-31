import React from "react";

import { Card, Flex, Heading } from "@radix-ui/themes";
import { Agent } from "@/model/agent";
import { useStateSubscription } from "@/hooks";

export default function AgentCard({ agent }: { agent: Agent }) {
  const {
    alive$,
    stateName$,
    commandIndex$,
    operandIndex$,
    buffer$,
    bufferCursor$
  } = agent.observableExecutionState;

  const alive = useStateSubscription(alive$, true);
  const stateName = useStateSubscription(stateName$, "start");
  const commandIndex = useStateSubscription(commandIndex$, 0);
  const operandIndex = useStateSubscription(operandIndex$, 0);
  const buffer = useStateSubscription(buffer$, []);
  const bufferCursor = useStateSubscription(bufferCursor$, 0);

  return (
    <Card>
      <Flex direction="column" width="100%">
        <Heading size="3">
          {agent.name}
        </Heading>
        <table>
          <tbody>
            <tr>
              <th>alive</th>
              <td>{alive ? "alive" : "dead"}</td>
            </tr>
            <tr>
              <th>state</th>
              <td>{stateName}</td>
            </tr>
            <tr>
              <th>command index</th>
              <td>{commandIndex}</td>
            </tr>
            <tr>
              <th>operand index</th>
              <td>{operandIndex}</td>
            </tr>
            <tr>
              <th>buffer</th>
              <td>{buffer}</td>
            </tr>
            <tr>
              <th>buffer cursor</th>
              <td>{bufferCursor}</td>
            </tr>
          </tbody>
        </table>
      </Flex>
    </Card>
  );
}

