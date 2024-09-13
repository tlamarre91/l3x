export class NotImplementedError extends Error {
  name = "NotImplementedError";
}

export class L3xError extends Error {
  name = "L3xError";
}

export class GameUiError extends L3xError {
  name = "GameUiError";
}
