import { Context, createContext } from "react";

import { BehaviorSubject, Observable } from "rxjs";
import { NetworkFactory } from "@/model/network/NetworkFactory";
import { Network, queryObjects } from "@/model/network";
import { Positioned } from "@/model/types";

export interface GameContextData {
  network: Network<Positioned, Positioned>;
  selectedObject$: Observable<ReturnType<typeof queryObjects>>;
}

export function makeGameContextData(): GameContextData {
  const data = {
    network: NetworkFactory.grid(5, 6),
    selectedObject$: new Observable<any>()
  } satisfies GameContextData;

  return data;;
}

export const GameContext = createContext<GameContextData>(makeGameContextData());
