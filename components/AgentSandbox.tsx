"use client";

import { Agent, AgentCommand, AgentCommandOutput } from "@/model";

import React, { useCallback, useState } from "react";
import AgentMessageLog from "./AgentMessageLog";

export default function AgentSandbox() {
  const [messages, setMessages] = useState<AgentCommandOutput[]>([]);

  const onOutput = useCallback((output: AgentCommandOutput) => {
    console.log({ output, now: Date.now() });
    // setMessages((messages) => [...messages ?? [], output]);
    // setMessages([output]);
    setMessages((messages) => [...messages, output]);
  }, []);

  const doTheThing = useCallback(() => {
    const secretAgentMan = new Agent();
    // setMessages([{ agent: secretAgentMan, message: "yo" }]);
    secretAgentMan.addState("start", {
      onEnter: (agent) => {
        console.log(`agent ${agent.name} entered start`);
        agent.setRegister(0, "WHOA");
        agent.queueCommand(new AgentCommand("echo", "hello 1 from the agent"));
        agent.queueCommand(new AgentCommand("echo", "reg 1 pre write", 1));
        agent.queueCommand(new AgentCommand("write", "hey write me", 1));
        agent.queueCommand(new AgentCommand("echo", "reg 0", 0));
        agent.queueCommand(new AgentCommand("echo", "reg 1", 1));
      },
      onExit: () => console.log("exit start!"),
      onOutput,
    });

    secretAgentMan.addState("not-start", {
      onEnter: () => console.log("enter not-start!"),
      onExit: () => console.log("exit not-start!"),
      onOutput,
    });

    secretAgentMan.setState("start");
    secretAgentMan.process();
    secretAgentMan.process();
    secretAgentMan.process();
    secretAgentMan.process();
    secretAgentMan.process();
    secretAgentMan.setState("not-start");
    secretAgentMan.process();
    secretAgentMan.process();
    secretAgentMan.setState("start");
  }, []);

  return (
    <>
      <div>messages!</div>
      <button onClick={doTheThing}>do it</button>
      <div><AgentMessageLog messages={messages}/></div>
    </>
  );
}

