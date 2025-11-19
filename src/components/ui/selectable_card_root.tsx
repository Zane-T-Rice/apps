import { Card } from "@chakra-ui/react";
import { ReactNode, RefObject } from "react";

export function SelectableCardRoot(props: {
  children: ReactNode;
  resourceId?: string;
  selectedResourceId?: string;
  ref?: RefObject<HTMLDivElement | null>;
}) {
  const { children, resourceId, selectedResourceId, ref } = props;

  return (
    <Card.Root
      ref={selectedResourceId === resourceId ? ref : null}
      overflow="hidden"
      variant="elevated"
      width="100%"
      height="100%"
      key={`navigation-bar-${resourceId}`}
      shadow={{
        base:
          selectedResourceId === resourceId
            ? "1px 1px 6px 1px rgba(0, 0, 0, .3)"
            : "1px 1px 6px 1px rgba(0, 0, 0, .3)",
        _dark:
          selectedResourceId === resourceId
            ? "1px 1px 6px 1px rgba(255, 255, 0, .4)"
            : "1px 1px 6px 1px rgba(255, 255, 255, .3)",
      }}
      bg={selectedResourceId === resourceId ? "#26547C" : "none"}
      color={selectedResourceId === resourceId ? "#FFD166" : "none"}
      _hover={{
        bg: {
          base:
            selectedResourceId !== resourceId ? "blackAlpha.300" : undefined,
          _dark:
            selectedResourceId !== resourceId ? "whiteAlpha.200" : undefined,
        },
      }}
    >
      {children}
    </Card.Root>
  );
}
