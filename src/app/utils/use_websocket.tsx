import { useAuth0 } from "@auth0/auth0-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// How often to check that there is a connection, and make one if there is not.
const CONNECTION_CHECK_MS = 5000;
// A page that was hidden (or a device that was asleep) for this long may have had its websocket
// dropped without being told, and it missed any messages sent in the meantime.
const POSSIBLY_STALE_AFTER_HIDDEN_MS = 15000;

export function useWebSocket<
  T extends { parent: string; entity: string },
>(props: {
  campaignId: string;
  scenarioId: string;
  websocketId: string;
  setResources: Dispatch<SetStateAction<T[]>>;
}): {
  sendMessage: (resource: T, action: string) => void;
  refresh: boolean;
  setRefresh: Dispatch<SetStateAction<boolean>>;
} {
  const {
    campaignId,
    scenarioId,
    // Used to identify messages sent by self (and ignore them).
    websocketId,
    setResources,
  } = props;
  const [refresh, setRefresh] = useState<boolean>(false);
  // Counts how many times a connection has been made, so each (re)connection can be announced.
  const [connectionCount, setConnectionCount] = useState<number>(0);
  // The one current websocket. Only the current websocket's events are acted on, so an old
  // websocket that is closing can not clobber a newer one.
  const wsRef = useRef<WebSocket | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const { getAccessTokenSilently } = useAuth0();

  const onMessage = useCallback(
    (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const resource = data.resource as T;
      // Ignore messages from self.
      // This only really happens in "next dev" mode
      // because the React hooks are invoked multiple times.
      if (websocketId === data.messageId) return;
      setResources((prev) => {
        const existingResourceIndex = prev.findIndex((prevResource) => {
          return (
            prevResource.parent === resource.parent &&
            prevResource.entity === resource.entity
          );
        });
        const resourceExists = existingResourceIndex !== -1;
        // Replace existing resource with updated one.
        if (data.action === "PATCH" && resourceExists) {
          return prev.map((prevResource, prevIndex) => {
            if (prevIndex === existingResourceIndex) return resource;
            else return prevResource;
          });
        }
        // Remove the existing resource as it was deleted.
        else if (data.action === "DELETE" && resourceExists) {
          return prev.filter((prevResource, prevIndex) => {
            if (prevIndex === existingResourceIndex) return false;
            else return true;
          });
        }
        // Do nothing the deleted resource already does not exist.
        else if (data.action === "DELETE" && !resourceExists) {
          return prev.map((r) => r);
        }
        // Add the new resource.
        else if (data.action === "POST" && !resourceExists) {
          return prev.map((prevResource) => prevResource).concat(resource);
        }
        // Change nothing, the resource already made it in another message.
        else if (data.action === "POST" && resourceExists) {
          return prev.map((r) => r);
        } else {
          // Fallback to just refreshing all resources.
          // This happens when an edit is made to a resource that
          // the client does not know about yet due to a missed
          // or out of order CREATE or DELETE action.
          //
          // This also happens whenever a client instructs other
          // clients to do a REFRESH action.
          setRefresh(true);
          return prev;
        }
      });
    },
    [websocketId, setResources],
  );

  // Make a websocket for the campaign and scenario if there is not one (or one being made).
  const connect = useCallback(async () => {
    const current = wsRef.current;
    if (
      isConnectingRef.current ||
      (current && current.readyState <= WebSocket.OPEN) ||
      !campaignId ||
      !scenarioId
    )
      return;

    isConnectingRef.current = true;
    try {
      const accessToken = await getAccessTokenSilently();
      if (!accessToken) return;

      const websocket = new WebSocket(
        `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_WEBSOCKETS_URL as string}?campaignId=${campaignId}&scenarioId=${scenarioId}`,
        [`${accessToken}`],
      );
      wsRef.current = websocket;

      websocket.onopen = () => {
        if (wsRef.current !== websocket) {
          websocket.close();
          return;
        }
        setConnectionCount((count) => count + 1);
        setRefresh(true);
      };

      websocket.onmessage = (event) => {
        if (wsRef.current === websocket) onMessage(event);
      };

      websocket.onclose = () => {
        if (wsRef.current === websocket) wsRef.current = null;
      };

      websocket.onerror = () => {};
    } catch {
      // Try again at the next check.
    } finally {
      isConnectingRef.current = false;
    }
  }, [campaignId, scenarioId, getAccessTokenSilently, onMessage]);

  // The websocket belongs to one scenario, so replace it when the scenario changes (and close it
  // when done). Declared before the effect that connects so the old one is closed first.
  useEffect(() => {
    return () => {
      const old = wsRef.current;
      wsRef.current = null;
      old?.close();
    };
  }, [campaignId, scenarioId]);

  // Keep a websocket connected.
  useEffect(() => {
    connect();
    const interval = setInterval(connect, CONNECTION_CHECK_MS);
    return () => {
      clearInterval(interval);
    };
  }, [connect]);

  // Anytime a client connects (or reconnects), tell other clients to refresh their data.
  useEffect(() => {
    const websocket = wsRef.current;
    if (connectionCount > 0 && websocket?.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          action: "REFRESH",
          messageId: websocketId,
          resource: {
            parent: "#CAMPAIGN#" + campaignId + "#SCENARIO#" + scenarioId,
          },
        }),
      );
    }
  }, [connectionCount, websocketId, campaignId, scenarioId]);

  // A browser can drop a websocket without telling the page, i.e. when a phone is locked, a laptop
  // sleeps, a tab is frozen in the background, or the network changes. The page then keeps
  // editing from stale data, and its edits are never sent to the other clients. So when coming
  // back after a while, replace the websocket, which also fetches everything again.
  useEffect(() => {
    let hiddenAt: number | null = null;

    const replaceWebSocket = () => {
      const old = wsRef.current;
      wsRef.current = null;
      old?.close();
      connect();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      if (
        hiddenAt !== null &&
        Date.now() - hiddenAt > POSSIBLY_STALE_AFTER_HIDDEN_MS
      )
        replaceWebSocket();
      hiddenAt = null;
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) replaceWebSocket();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", replaceWebSocket);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", replaceWebSocket);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [connect]);

  const sendMessage = useCallback(
    async (resource: T, action: string) => {
      const websocket = wsRef.current;
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(
          JSON.stringify({
            action,
            messageId: websocketId,
            resource: resource,
          }),
        );
      }
    },
    [websocketId],
  );

  return {
    sendMessage,
    refresh,
    setRefresh,
  };
}
