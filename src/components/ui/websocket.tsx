import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";

export function useWebSocket<T>(props: {
  campaignId: string;
  scenarioId: string;
}): {
  messages: T[];
  sendMessage: (resource: T) => void;
} {
  const { campaignId, scenarioId } = props;
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
          setMessages((prevMessages) => [...prevMessages, event.data as T]);
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
    [campaignId, scenarioId, ws],
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
      ws.send(JSON.stringify(resource));
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
