import React from "react";
import { Badge, Box, Flex, Heading } from "@radix-ui/themes";
import NextLink from "next/link";
import { NetworkEdge, NetworkNode } from "@/model/network";
import { Agent } from "@/model/agent";

export const DEFAULT_BADGE_COLORS = {
  node: "purple",
  edge: "green",
  agent: "blue"
} as const;

export const FRAGMENT_ID_PREFIXES = {
  node: "#n:",
  edge: "#e:",
  agent: "#a:",
} as const;

export type NetworkObjectLinkProps = {
  object: Agent | NetworkEdge | NetworkNode;
}

export default function NetworkObjectLink({
  object,
}: NetworkObjectLinkProps) {

  const badgeColor = DEFAULT_BADGE_COLORS[object.type];
  const fragmentId = FRAGMENT_ID_PREFIXES[object.type] + object.name;

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

