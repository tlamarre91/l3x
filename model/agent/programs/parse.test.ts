import { expect, it } from "vitest";
import * as programs from ".";

it("parse works", () => {
  // (expect this not to compile because of bad namedregister)
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

  const parsed = programs.parse(PARSEABLE_PROGRAM);
  expect(parsed).toMatchSnapshot();
});

it("parse throws on bad syntax", () => {

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

  const tryParse = () => programs.parse(UNPARSEABLE_PROGRAM);
  expect(tryParse).toThrowErrorMatchingSnapshot();
});


