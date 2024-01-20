import React, { CSSProperties, useMemo } from "react";

import { Card, Flex, Heading } from "@radix-ui/themes";
import { Agent } from "@/model/agent";
import { useStateSubscription } from "@/hooks";

export default function AgentCard({ agent }: { agent: Agent }) {
  const execState = agent.observableExecutionState;

  const alive = useStateSubscription(execState.alive$, execState.getAlive);
  const stateName = useStateSubscription(execState.stateName$, execState.getStateName);
  const commandIndex = useStateSubscription(execState.commandIndex$, execState.getCommandIndex);
  const operandIndex = useStateSubscription(execState.operandIndex$, execState.getOperandIndex);
  const buffer = useStateSubscription(execState.buffer$, execState.getBuffer);
  const bufferCursor = useStateSubscription(execState.bufferCursor$, execState.getBufferCursor);

  const currentCodeLine = useMemo(() => {
    // TODO: could make this easier. have a "pending command" observable,
    // since that would probably help in Agent anyway?
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
              <th>status</th>
              <td>{alive ? "alive" : "dead"}</td>
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

