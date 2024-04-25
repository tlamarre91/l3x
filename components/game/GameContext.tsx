import { createContext } from "react";

import { BehaviorSubject, Observable } from "rxjs";
import { NetworkFactory } from "@/model/network/NetworkFactory";
import { Network, queryObjects } from "@/model/network";
import { NetworkView } from "@/model/network/NetworkView";
import { Game } from "@/model/game/Game";

export type SelectableObject = ReturnType<typeof queryObjects>; // TODO: better type

export interface GameContextValue {
  game: Game;
  selectedObject$: Observable<SelectableObject | null>;
  selectObject: (obj: SelectableObject | null) => void;
  getSelectedObject: () => SelectableObject | null;
}

export function makeGameContextData(): GameContextValue {
  const [network, networkView] = NetworkFactory.demo();
  const game = new Game(network, networkView);
  const selectedObject$ = new BehaviorSubject<SelectableObject | null>(null);

  const value = {
    game,
    selectedObject$: selectedObject$.asObservable(),
    selectObject(obj: SelectableObject | null) {
      selectedObject$.next(obj);
    },
    getSelectedObject() {
      return selectedObject$.getValue();
    }
  } satisfies GameContextValue;

  return value;
}

export const GameContext = createContext<GameContextValue>(makeGameContextData());
