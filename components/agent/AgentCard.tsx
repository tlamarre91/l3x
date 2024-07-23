import React, { CSSProperties, useCallback, useMemo, useState } from "react";

import { Card, Flex, Heading } from "@radix-ui/themes";
import { Agent } from "@/model/agent";
import { useStateSubscription } from "@/hooks";
import CodeEditor from "./CodeEditor";

export interface AgentCardProps {
  agent: Agent;
  edit: boolean;
}

export default function AgentCard({
  agent,
  edit
}: AgentCardProps) {
  const [editingCode, setEditingCode] = useState(edit);
  const execState = agent.executionStateObservables;
  const buffer = agent.bufferObservables;

  const alive = useStateSubscription(execState.alive$, () => execState.getAlive());
  const stateName = useStateSubscription(execState.stateName$, () => execState.getStateName());
  const commandIndex = useStateSubscription(execState.commandIndex$, () => execState.getCommandIndex());
  const operandIndex = useStateSubscription(execState.operandIndex$, () => execState.getOperandIndex());
  const bufferData = useStateSubscription(buffer.data$, buffer.getData);
  const bufferCursor = useStateSubscription(buffer.cursorIndex$, buffer.getCursorIndex);

  const toggleEditingCode = () => setEditingCode((state) => !state);

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

  const onEditorCommit = (code: string) => {
    try {
      agent.reprogram(code);
      setEditingCode(false);
    } catch (err: unknown) {
      console.error(`Couldn't reprogram agent ${agent.name} due to error`);
      console.error(err);
    }
  };

  const codeEditBox = (
    <CodeEditor
      onCommit={onEditorCommit}
      onExit={() => setEditingCode(false)}
      code={agent.stateMachine.program.codeLines.join("\n")}
    />
  );

  const codeViewBox = (
    // TODO: extract to StateMachineViewer or something
    <div>
      <button onClick={toggleEditingCode}>edit</button>
      <pre>
        {agent.stateMachine.program.codeLines.map((codeLine, codeLineIndex) => {
          const style: CSSProperties = { };
          if (currentCodeLine === codeLineIndex) {
            style.backgroundColor = "green";
          }
          return (
            <span key={codeLineIndex} style={style}>{codeLine}<br /></span>
          );
        })}
      </pre>
    </div>
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
              <td>{bufferData.length > 0 ? bufferData.join(", ") : "<nothin>"}</td>
            </tr>
            <tr>
              <th>buffer cursor</th>
              <td>{bufferCursor}</td>
            </tr>
          </tbody>
        </table>
        { editingCode ? codeEditBox : codeViewBox}
      </Flex>
    </Card>
  );
}

