import { Card } from "@chakra-ui/react"
import { ReactNode } from "react"

export function SelectableCardRoot<T extends { id: string }>(props: {
  children: ReactNode;
  resource: T;
  selectedResource?: T;
}) {
  const { children, resource, selectedResource } = props;

  return (<Card.Root
    variant="elevated"
    width="95%"
    height="95%"
    key={`navigation-bar-${resource.id}`}
    shadow={{
      base: selectedResource &&
        selectedResource.id === resource.id
        ? "1px 1px 6px 1px rgba(0, 0, 0, .3)"
        : "1px 1px 6px 1px rgba(0, 0, 0, .3)",
      _dark: selectedResource &&
        selectedResource.id === resource.id
        ? "1px 1px 6px 1px rgba(255, 255, 0, .4)"
        : "1px 1px 6px 1px rgba(255, 255, 255, .3)",
    }}
    bg={
      selectedResource &&
        selectedResource.id === resource.id
        ? "#26547C"
        : "none"
    }
    color={
      selectedResource &&
        selectedResource.id === resource.id
        ? "#FFD166"
        : "none"
    }
    _hover={{
      bg: {
        base: (!selectedResource) ||
          (selectedResource &&
            selectedResource.id !== resource.id)
          ? "blackAlpha.500"
          : undefined,
        _dark: (!selectedResource) ||
          (selectedResource &&
            selectedResource.id !== resource.id)
          ? "whiteAlpha.500"
          : undefined,
      }
    }}
  >
    {children}
  </Card.Root>)
}