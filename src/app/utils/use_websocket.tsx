import { useAuth0 } from "@auth0/auth0-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

export function useWebSocket<
  T extends { parent: string; entity: string },
>(props: {
  campaignId: string;
  scenarioId: string;
  websocketId: string;
  setResources: Dispatch<SetStateAction<T[]>>;
}): {
  messages: T[];
  sendMessage: (resource: T, action: string) => void;
} {
  const {
    campaignId,
    scenarioId,
    // Used to identify messages sent by self (and ignore them).
    websocketId,
    setResources,
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
          // Ignore messages from self.
          // This only really happens in "next dev" mode
          // because the React hooks are invoked multiple times.
          const data = JSON.parse(event.data);
          const resource = data.resource as T;
          if (websocketId !== data.messageId) {
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
                return prev
                  .map((prevResource) => prevResource)
                  .concat(resource);
              }
              // Change nothing, the resource already made it in another message.
              else if (data.action === "POST" && resourceExists) {
                return prev.map((r) => r);
              } else {
                // Fallback to just refreshing all resources.
                // This happens when an edit is made to a resource that
                // the client does not know about yet due to a missed
                // or out of order CREATE or DELETE action.
                setMessages((prevMessages) => [...prevMessages, resource]);
                return prev;
              }
            });
          }
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
    [campaignId, scenarioId, ws, websocketId, setResources],
  );

  const connect = async () => {
    wsHooks(await getAccessTokenSilently());
  };

  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (resource: T, action: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({ action, messageId: websocketId, resource: resource }),
      );
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
