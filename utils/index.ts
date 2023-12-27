export type Status = "ok" | "fu";

export function timestamp() {
  return String(Date.now()).slice(-8);
}

