import { expect, it } from "vitest";
import * as programs from ".";

it("parse+compile works with a bunch of extra spaces", () => {
  const COMPILEABLE_PROGRAM_WITH_SPACES = `   def start
        echo hey dudes
              echo this is about it huh?

def end
echo bye dudes
`;

  const parsed = programs.parse(COMPILEABLE_PROGRAM_WITH_SPACES);
  const compiled = programs.compile(parsed);
  expect(compiled).toMatchSnapshot();
});

it("parse+compile throws on bad semantics", () => {
  const UNCOMPILEABLE_PROGRAM = `echo hey dudes
echo should've started with def

def end
echo bye dudes
`;

  const program = programs.parse(UNCOMPILEABLE_PROGRAM);
  const tryCompile = () => {
    programs.compile(program);
  };
  expect(tryCompile).toThrowErrorMatchingSnapshot();
});

it("parse+compile with test command", () => {
  const program = `
def start
test $pc = 0
`;
  const compiled = programs.parseAndCompile(program);
  expect(compiled).toMatchSnapshot();
});

it("sandbox", () => {
  // const program = programs.parse(TEST_PROGRAM_WITH_REGISTERS);
  const program = programs.parse(TEST_PROGRAM);
  const stateMachine = programs.compile(program);
  expect(stateMachine).toMatchSnapshot();
});

const TEST_PROGRAM = `def start
echo hey1
echo hey2
go loop

def loop
echo woo1
echo woo2
go start
`;
