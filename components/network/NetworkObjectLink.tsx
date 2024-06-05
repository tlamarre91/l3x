import React, { useMemo } from "react";
import { Badge } from "@radix-ui/themes";
import { Agent } from "@/model/agent";
import { makeFragmentId } from "@/model/network/queryObjects";
import { NetworkEdge } from "@/model/network/NetworkEdge";
import { NetworkNode } from "@/model/network/NetworkNode";

export const DefaultBadgeColors = {
  node: "purple",
  edge: "green",
  agent: "crimson"
} as const;

export type NetworkObjectLinkProps = {
  object: Agent | NetworkEdge | NetworkNode;
}

export default function NetworkObjectLink({
  object,
}: NetworkObjectLinkProps) {

  const [badgeColor, fragmentId] = useMemo(() => {
    const badgeColor = DefaultBadgeColors[object.type];
    const fragmentId = makeFragmentId(object);
    return [badgeColor, fragmentId];
  }, [object]);

  return (
    <a href={fragmentId}>
      <Badge
        color={badgeColor}
        style={{
          maxWidth: "30rem",
          textOverflow: "ellipsis",
          cursor: "pointer"
        }}>
        {object.name}
      </Badge>
    </a>
  );
}

