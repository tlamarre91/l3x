import { expect, it } from "vitest";
import * as programs from ".";
import { ParseError } from "./parse";

it("parse works", () => {
  // (expect this not to compile because of bad namedregister)
  const PARSEABLE_PROGRAM = `def start
echo hello world
test $pd > 0

def loopdeloop
echo again 1
echo again 2
go loopdeloop

def moveover
go f
go start
`;

  const parsed = programs.parse(PARSEABLE_PROGRAM);
  expect(parsed).toMatchSnapshot();
});

it("parse throws on bad syntax", () => {
  const UNPARSEABLE_PROGRAM = `def start
echo hello world
scan file 0 20
branch loopdeloop moveover
`;

  const tryParse = () => programs.parse(UNPARSEABLE_PROGRAM);
  expect(tryParse).toThrowErrorMatchingSnapshot();
});

it("parse error can be printed with context", () => {
  const UNPARSEABLE_PROGRAM = `def start
test $peek > 0
`;

  try {
    programs.parse(UNPARSEABLE_PROGRAM);
    throw Error("Expected ParseError"); // TODO: what's the right way to do this?
  } catch (error: unknown) {
    if (!(error instanceof ParseError)) {
      console.log({ error });
      throw Error("Expected ParseError"); // TODO: what's the right way to do this?
    }

    expect(error.withContext(UNPARSEABLE_PROGRAM)).toMatchSnapshot();
  }
});

it("different parse error can be printed with context", () => {
  const UNPARSEABLE_PROGRAM = `def start
test $pc > 0
test $pc _ 0
`;

  try {
    programs.parse(UNPARSEABLE_PROGRAM);
    throw Error("Expected ParseError"); // TODO: what's the right way to do this?
  } catch (error: unknown) {
    if (!(error instanceof ParseError)) {
      console.log({ error });
      throw Error("Expected ParseError"); // TODO: what's the right way to do this?
    }

    expect(error.withContext(UNPARSEABLE_PROGRAM)).toMatchSnapshot();
  }
});
