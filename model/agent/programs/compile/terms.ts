import * as commands from "../commands";
import * as parse from "../parse";
import { SourceMap } from "..";

export function compileRefTerm(token: parse.RefToken, sourceMap: SourceMap): commands.RefTerm {
  const term = { type: "ref", register: token.symbol } as const;
  sourceMap.set(term, token.start);
  return term;
}

export function compileComparisonTerm(
  token: parse.ComparisonToken,
  sourceMap: SourceMap,
): commands.ComparisonTerm {
  const term = { type: "comparison", comparison: token.symbol } as const;
  sourceMap.set(term, token.start);
  return term;
}

export function compileOperands(tokens: parse.Token[], sourceMap: SourceMap): commands.Term[] {
  return tokens.map((token) => compileOperand(token, sourceMap));
}

export function compileOperand(token: parse.Token, sourceMap: SourceMap): commands.Term {
  if (parse.isRefToken(token)) {
    return compileRefTerm(token, sourceMap);
  }

  if (parse.isComparisonToken(token)) {
    return compileComparisonTerm(token, sourceMap);
  }

  const term = { type: "literal", value: token.symbol } as const;
  sourceMap.set(term, token.start);
  return term;
}
