import { SizeValue } from "@/components/types";

export const Status = {
  ok: "ok",
  fu: "fu"
} as const;
export type StatusValue = typeof Status[keyof typeof Status];

export function timestamp() {
  return String(Date.now()).slice(-8);
}

// TODO: oh yeah, do sizeToCssVar too
export function sizeToPx(size: SizeValue): string {
  switch (size) {
    case "0":
      return "0px";
    case "1":
      return "2px";
    case "2":
      return "4px";
    case "3":
      return "8px";
    case "4":
      return "16px";
    case "5":
      return "32px";
  }
}
