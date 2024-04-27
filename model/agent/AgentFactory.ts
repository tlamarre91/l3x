import { Agent } from "./Agent";

export class AgentFactory {
  static zigzag(name: string) {
    const ZIGZAG_PROGRAM = `def start
write right $f
echo front is $f
move $pf
write i'm
test here = $pf
write here
test here = $pf
go l1

def l1
move down
go start
`;
    const agent = Agent.fromCode(name, ZIGZAG_PROGRAM);
    return agent;
  }

  static circle(name: string) {
    const CIRCLE_PROGRAM = `def start
move right
move right
move right
move down
move down
move down
move left
move left
move left
move up
move up
move up
go start
`;
    const agent = Agent.fromCode(name, CIRCLE_PROGRAM);
    return agent;
  }
}
