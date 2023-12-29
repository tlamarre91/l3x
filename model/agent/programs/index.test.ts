import { expect, it } from "vitest";
import * as programs from ".";

it("parse works", () => {
  const parsed = programs.parse(PARSEABLE_PROGRAM);
  expect(parsed).toMatchSnapshot();
});

it("parse throws", () => {
  const tryParse = () => programs.parse(UNPARSEABLE_PROGRAM);
  expect(tryParse).toThrowErrorMatchingSnapshot();
});

it("parse+compile works", () => {
  const parsed = programs.parse(COMPILEABLE_PROGRAM_WITH_SPACES);
  const compiled = programs.compile(parsed);
  expect(compiled).toMatchSnapshot();
});

it("parse+compile throws", () => {
  const parsed = programs.parse(UNCOMPILEABLE_PROGRAM);
  const tryCompile = () => {
    programs.compile(parsed);
  };
  expect(tryCompile).toThrowErrorMatchingSnapshot();
});

const PARSEABLE_PROGRAM = `def start
echo hello world
test $peeklast > 0

def loopdeloop
echo again 1 $loop
echo again 2 $loop
go loopdeloop

def moveover
go f
go start
`;

const UNPARSEABLE_PROGRAM = `def start
echo hello world
scan file 0 20
test $peeklast > 0
branch loopdeloop moveover

def loopdeloop
echo again 1 $loop
echo again 2 $loop
go loopdeloop

def moveover
cross f
go start
`;

const COMPILEABLE_PROGRAM_WITH_SPACES = `   def start
        echo hey dudes
              echo this is about it huh?

def end
echo bye dudes
`;

const UNCOMPILEABLE_PROGRAM = `echo hey dudes
echo should've started with def

def end
echo bye dudes
`;

const SANDBOX_PROGRAM = `def start
echo hello sandbox
`;
