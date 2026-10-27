import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// After an action, check again at these delays (in ms, one after the other) until the status changes.
// Some actions finish after the service has already responded.
const AFTER_ACTION_DELAYS_MS = [0, 2000, 3000, 5000, 10000, 20000, 30000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useServerStatusRefresh<
  T extends { id: string; status: string },
>(props: {
  servers: T[];
  setServers: Dispatch<SetStateAction<T[]>>;
  getServer: (server: Pick<T, "id">) => Promise<T | null>;
  getServers: () => Promise<T[] | null>;
}) {
  const { setServers } = props;
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  const [isRefreshingAll, setIsRefreshingAll] = useState<boolean>(false);

  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });
  const isMounted = useRef<boolean>(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refreshServer = useCallback(
    async (id: string): Promise<string | undefined> => {
      setRefreshingIds((prev) => new Set(prev).add(id));
      let status = "unknown";
      try {
        status = (await latest.current.getServer({ id }))?.status ?? "unknown";
      } catch {
        // The status stays unknown when the service could not be reached.
      }
      if (!isMounted.current) return undefined;
      setServers((prev) =>
        prev.map((server) =>
          server.id === id ? { ...server, status } : server,
        ),
      );
      setRefreshingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return status;
    },
    [setServers],
  );

  const refreshAllServers = useCallback(async () => {
    setIsRefreshingAll(true);
    try {
      const responseServers = await latest.current.getServers();
      if (responseServers && isMounted.current) setServers(responseServers);
    } finally {
      if (isMounted.current) setIsRefreshingAll(false);
    }
  }, [setServers]);

  const refreshServerAfterAction = useCallback(
    async (id: string) => {
      const before = latest.current.servers.find(
        (server) => server.id === id,
      )?.status;
      for (const delay of AFTER_ACTION_DELAYS_MS) {
        if (delay) await sleep(delay);
        if (!isMounted.current) return;
        if ((await refreshServer(id)) !== before) return;
      }
    },
    [refreshServer],
  );

  return {
    refreshingIds,
    isRefreshingAll,
    refreshServer,
    refreshAllServers,
    refreshServerAfterAction,
  };
}
