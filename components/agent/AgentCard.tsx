import React, { CSSProperties, useMemo } from "react";

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

  const currentCodeLine = useMemo(() => {
    // TODO: could make this easier. have a "pending command" observable?
    const currentProc = agent.stateMachine.procedures.get(stateName);
    const currentCmd = currentProc?.commands[commandIndex];
    if (currentCmd == null) {
      return undefined;
    }
    const lineAndColumn = agent.stateMachine.sourceMap.get(currentCmd);

    return lineAndColumn?.line;
  }, [stateName, commandIndex, operandIndex]);
  
  const codeBox = (
    <pre>
      {agent.stateMachine.program.codeLines.map((codeLine, codeLineIndex) => {
        let style: CSSProperties = { };
        if (currentCodeLine === codeLineIndex) {
          style.backgroundColor = "green";
        }
        return (
          <span key={codeLineIndex} style={style}>{codeLine}<br /></span>
        );
      })}
    </pre>
  );

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
        {codeBox}
      </Flex>
    </Card>
  );
}

