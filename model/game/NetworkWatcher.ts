import { map, filter } from "rxjs";
import { ObservableAndGetter } from "@/model/types";
import { ObjectiveState } from "./Objective";
import { Network } from "@/model/network";
import { Agent } from "@/model/agent";

export type NetworkWatcher = (network: Network) => ObservableAndGetter<ObjectiveState>;

export class NetworkWatcherFactory {
  static agentInNodeWatcher(
    nodeName: string
  ): NetworkWatcher {
    function watcher(network: Network) {
      function observeState(agents: Agent[]): ObjectiveState {
        return {
          value: agents.length === 0 ? "fail" : "pass",
          lastChangedAt: network.clockCount
        };
      }
      console.log(`gonna watch ${network.name}`);

      const nodeToWatch = network.nodesByName.get(nodeName);
      if (nodeToWatch == null) {
        throw new Error(`Couldn't find node ${nodeName} in network ${network.name}`);
      }

      console.log(`gonna watch node ${nodeToWatch.name}`);

      let currentState = observeState(nodeToWatch.getAgents());

      const state$ = nodeToWatch.agents$.pipe(
        map((agents) => observeState(agents)),
        filter((state) => {
          if (state.value === currentState.value) {
            return false;
          }

          // Write down the new state and let it get emitted
          currentState = state;
          return true;
        })
      );

      return [state$, () => observeState(nodeToWatch.getAgents())] as const;
    }

    return watcher;
  }

  static agentKnowsWordWatcher(
    agentName: string,
    magicWord: string,
  ): NetworkWatcher {
    function watcher(network: Network) {
      function observeState(data: string[], word: string): ObjectiveState {
        return {
          value: data.includes(word) ? "pass" : "fail",
          lastChangedAt: network.clockCount
        };
      }

      const agent = network.agentsByName.get(agentName);
      if (agent == null) {
        throw new Error(`Couldn't find node ${agentName} in network ${network.name}`);
      }

      console.log(`gonna watch agent ${agent.name} to see if he learns "${magicWord}"`);

      let currentState = observeState(agent.bufferObservables.getData(), magicWord);

      const state$ = agent.bufferObservables.data$.pipe(
        map((data) => observeState(data, magicWord)),
        filter((state) => {
          if (state.value === currentState.value) {
            return false;
          }

          // Write down the new state and let it get emitted
          currentState = state;
          return true;
        })
      );

      return [state$, () => observeState(agent.bufferObservables.getData(), magicWord)] as const;
    }

    return watcher;
  }
}
