import React from "react";

import { AgentCommandOutput } from "@/model";

type AgentMessageLogProps = { messages?: AgentCommandOutput[] };

export default function AgentMessageLog({ messages }: AgentMessageLogProps) {
  return (
    <div>
      {messages?.map((message, index) => {
        return (
          <div key={index}>{message.agent.name} sent {message.message}</div>
        );
      })}
    </div>
  );
}
