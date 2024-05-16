import { BehaviorSubject, Observable, map, merge } from "rxjs";

export const NamedRegisters = {
  cursor: "$c",
  /** same as cursor, but move the cursor left after reading */
  cursorDec: "$cd",
  /** same as cursor, but move the cursor right after reading */
  cursorInc: "$ci",
  front: "$f",
  back: "$b",
  popCursor: "$pc",
  /** same as popCursor, but move the cursor left */
  popCursorDec: "$pd",
  popFront: "$pf",
  popBack: "$pb",
} as const;

export type NamedRegister = typeof NamedRegisters[keyof typeof NamedRegisters];

export function isNamedRegister(s: string | undefined): s is NamedRegister {
  const isNamedRegister = Object.values(NamedRegisters).includes(s as NamedRegister);
  return isNamedRegister;
}

/**
 * Collection of strings supporting read, push, pop, etc.
 */
export class DataDeque {
  #cursorIndex = new BehaviorSubject(0);
  #cachedObservables: DataDequeObservables | undefined;
  #array = new BehaviorSubject(new Array<string>());

  constructor(public capacity: number) {
  }

  /** Set cursor index but keep it in bounds */
  #safeSetCursorIndex(index: number) {
    const clampedIndex = Math.min(
      Math.max(
        0,
        index
      ),
      this.#array.getValue().length
    );
    this.#cursorIndex.next(clampedIndex);
  }

  #incrementCursorIndex(inc: number) {
    const index = this.#cursorIndex.getValue() + inc;
    this.#safeSetCursorIndex(index);
  }

  /**
   * Count the "number of bytes" stored in #array
   */
  #measureArray() {
    let sum = 0;
    for (const s of this.#array.getValue()) {
      sum += s.length + 1; // add 1 for the space between strings
    }

    return sum;
  }

  accessNamedRegister(register: NamedRegister, dataToWrite?: string): string {
    switch (register) {
      case NamedRegisters.cursor:
        return this.accessCursor(false, dataToWrite, 1);

      case NamedRegisters.cursorDec:
        return this.accessCursor(false, dataToWrite, 0);

      case NamedRegisters.cursorInc:
        return this.accessCursor(false, dataToWrite, 1);

      case NamedRegisters.popCursor:
        return this.accessCursor(true, dataToWrite);

      case NamedRegisters.popCursorDec:
        return this.accessCursor(true, dataToWrite, -1);

      case NamedRegisters.front:
        return this.accessBoundary(false, dataToWrite, false);

      case NamedRegisters.popFront:
        return this.accessBoundary(true, dataToWrite, false);

      case NamedRegisters.back:
        return this.accessBoundary(false, dataToWrite, true);

      case NamedRegisters.popBack:
        return this.accessBoundary(true, dataToWrite, true);
    }
  }

  accessIndex(index: number, pop: boolean, dataToWrite?: string) {
    const arr = this.#array.getValue();
    const val = arr[index];
    const deleteCount = pop ? 1 : 0;

    if (dataToWrite != null) {
      arr.splice(index, deleteCount, dataToWrite);
    } else {
      arr.splice(index, deleteCount);
    }

    this.#array.next(arr);

    return val;
  }

  accessCursor(pop: boolean, dataToWrite?: string, inc: number = 0) {
    const cursorIndex = this.#cursorIndex.getValue();
    const val = this.accessIndex(cursorIndex, pop, dataToWrite);
    this.#incrementCursorIndex(inc);

    return val;
  }

  accessBoundary(pop: boolean, dataToWrite?: string, back: boolean = true) {
    const arr = this.#array.getValue();
    const index = back ? arr.length - 1 : 0;

    return this.accessIndex(index, pop, dataToWrite);
  }

  asObservables(): DataDequeObservables {
    if (this.#cachedObservables == null) {
      const cursorIndex$ = this.#cursorIndex.asObservable();

      // TODO: maybe this works???
      const dataAtCursor$ = merge(cursorIndex$, this.#array).pipe(map((indexOrArray) => {
        if (typeof indexOrArray === "number") {
          return this.#array.getValue()[indexOrArray];
        }

        return indexOrArray[this.#cursorIndex.getValue()];
      }));

      const data$ = this.#array.asObservable();

      this.#cachedObservables = {
        cursorIndex$,
        getCursorIndex: () => this.#cursorIndex.getValue(),
        dataAtCursor$,
        getDataAtCursor: () => this.#array.getValue()[this.#cursorIndex.getValue()],
        data$,
        getData: () => this.#array.getValue()
      };
    }

    return this.#cachedObservables;
  }
}

export type DataDequeObservables = {
  cursorIndex$: Observable<number>;
  getCursorIndex: () => number;
  dataAtCursor$: Observable<string>;
  getDataAtCursor: () => string;
  data$: Observable<string[]>;
  getData: () => string[];
}
