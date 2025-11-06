import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    getAccessTokenSilently().then((token) => {
      if (campaignId && scenarioId) {
        const websocket = new WebSocket(
          `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_WEBSOCKETS_URL as string}?campaignId=${campaignId}&scenarioId=${scenarioId}`,
          [token],
        ); // Replace with your WebSocket server URL

        websocket.onopen = () => {
          console.log("WebSocket connection established.");
          setWs(websocket);
        };

        websocket.onmessage = (event) => {
          console.log("Message received:", event.data);
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
    });
  }, [campaignId, scenarioId, getAccessTokenSilently]); // Empty dependency array ensures this runs once on mount

  const sendMessage = (resource: T) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(resource));
    } else {
      console.warn("WebSocket is not open.");
    }
  };

  return {
    messages,
    sendMessage,
  };
}
