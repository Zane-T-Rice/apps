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
      bg:
        (!selectedResource) ||
          (selectedResource &&
            selectedResource.id !== resource.id)
          ? "blackAlpha.500"
          : undefined,
    }}
  >
    {children}
  </Card.Root>)
}