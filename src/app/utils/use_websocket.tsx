import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";

export function useWebSocket<T>(props: {
  campaignId: string;
  scenarioId: string;
  websocketId: string;
}): {
  messages: T[];
  sendMessage: (resource: T) => void;
} {
  const {
    campaignId,
    scenarioId,
    // Used to identify messages sent by self (and ignore them).
    websocketId,
  } = props;
  const [messages, setMessages] = useState<T[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { getAccessTokenSilently } = useAuth0();

  const wsHooks = useCallback(
    (token: string) => {
      if (
        campaignId &&
        scenarioId &&
        token &&
        ws?.readyState !== WebSocket.OPEN
      ) {
        const websocket = new WebSocket(
          `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_WEBSOCKETS_URL as string}?campaignId=${campaignId}&scenarioId=${scenarioId}`,
          [`${token}`],
        );

        websocket.onopen = () => {
          console.log("WebSocket connection established.");
          setWs(websocket);
        };

        websocket.onmessage = (event) => {
          console.log("Got a message: event: ", event);
          console.log("Got a message: data: ", event?.data);
          console.log("Got a message: messageId", event?.data?.messageId);
          // Ignore messages from self.
          // This only really happens in "next dev" mode
          // because the React hooks are invoked multiple times.
          if (websocketId !== event?.data?.messageId)
            setMessages((prevMessages) => [
              ...prevMessages,
              event.data?.resource as T,
            ]);
        };

        websocket.onclose = () => {
          console.log("WebSocket connection closed.");
          setWs(null);
        };

        websocket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        // Cleanup function to close the connection
        return () => {
          websocket.close();
        };
      }
    },
    [campaignId, scenarioId, ws, websocketId],
  );

  const connect = async () => {
    wsHooks(await getAccessTokenSilently());
  };

  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (resource: T) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ messageId: websocketId, resource: resource }));
    } else {
      console.warn("WebSocket is not open, try to re-establish connection.");
      connect();
    }
  };

  return {
    messages,
    sendMessage,
  };
}
