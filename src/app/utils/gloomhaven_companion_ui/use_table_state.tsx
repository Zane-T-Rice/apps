import { useCallback, useEffect, useState } from "react";
import {
  getStateKey,
  State,
  useScenarioState,
} from "../gloomhaven_companion_service/gloomhaven_companion_service_state";

// The round, elements, initiatives and whose turn it is for a scenario, kept in sync between players.
export function useTableState(campaignId: string, scenarioId: string) {
  const { getAllState, putState } = useScenarioState(campaignId, scenarioId);
  const [state, setState] = useState<Record<string, string>>({});

  useEffect(() => {
    const reset = async () => {
      setState({});
    };
    reset();
  }, [campaignId, scenarioId]);

  const reloadState = useCallback(async () => {
    const states = await getAllState();
    if (!states) return;
    const next: Record<string, string> = {};
    states.forEach((s) => (next[getStateKey(s)] = s.value ?? ""));
    setState(next);
  }, [getAllState]);

  // A state another player saved.
  const onStateMessage = useCallback((resource: State) => {
    setState((prev) => ({
      ...prev,
      [getStateKey(resource)]: resource.value ?? "",
    }));
  }, []);

  // Show the new values right away, then save them and tell the other players.
  const saveState = useCallback(
    async (
      entries: [string, string][],
      sendMessage: (resource: State, action: string) => void,
    ) => {
      setState((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      const results = await Promise.all(
        entries.map(async ([key, value]) => {
          const saved = await putState(key, value);
          if (saved) sendMessage(saved, "PATCH");
          return saved;
        }),
      );
      // A save failed, so trust the server over what was shown.
      if (results.some((saved) => !saved)) reloadState();
    },
    [putState, reloadState],
  );

  return { state, reloadState, onStateMessage, saveState };
}

export type SaveState = (entries: [string, string][]) => Promise<void>;
