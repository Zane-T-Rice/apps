import { useEffect, useState } from "react";

export function useWebSocket<T>(): {
  messages: T[];
  sendMessage: (resource: T) => void;
} {
  const [messages, setMessages] = useState<T[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Establish connection
    const websocket = new WebSocket(
      process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_WEBSOCKETS_URL as string,
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
  }, []); // Empty dependency array ensures this runs once on mount

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
