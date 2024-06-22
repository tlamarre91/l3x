export const Status = {
  ok: "ok",
  fu: "fu"
} as const;
export type StatusValue = typeof Status[keyof typeof Status];

export function timestamp() {
  return String(Date.now()).slice(-8);
}

