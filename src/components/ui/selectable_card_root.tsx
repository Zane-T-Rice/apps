import { Card } from "@chakra-ui/react";
import { ReactNode, RefObject } from "react";

export function SelectableCardRoot(props: {
  children: ReactNode;
  selected: boolean;
  ref?: RefObject<HTMLDivElement | null>;
}) {
  const { children, selected, ref } = props;

  return (
    <Card.Root
      ref={selected ? ref : null}
      overflow="hidden"
      variant="elevated"
      width="100%"
      height="100%"
      shadow={{
        base: selected
          ? "1px 1px 6px 1px rgba(0, 0, 0, .3)"
          : "1px 1px 6px 1px rgba(0, 0, 0, .3)",
        _dark: selected
          ? "1px 1px 6px 1px rgba(255, 255, 0, .4)"
          : "1px 1px 6px 1px rgba(255, 255, 255, .3)",
      }}
      bg={selected ? "#26547C" : "none"}
      color={selected ? "#FFD166" : "none"}
      _hover={{
        bg: {
          base: !selected ? "blackAlpha.300" : undefined,
          _dark: !selected ? "whiteAlpha.200" : undefined,
        },
      }}
    >
      {children}
    </Card.Root>
  );
}
