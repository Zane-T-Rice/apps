"use client";

import { Badge, Grid, Stack, Text } from "@chakra-ui/react";
import { memo } from "react";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import {
  getKindInfo,
  getTemplateKind,
  SCOPE_COLORS,
  SCOPE_LABELS,
  templateTitle,
} from "@/app/utils/gloomhaven_companion_ui/template_kind";
import { Button } from "../recipes/button";

// One template in the list, with its buttons. It is drawn again only when what it shows changes,
// so typing in the search box does not draw all the rows that are still shown.
export const TemplateRow = memo(function TemplateRow(props: {
  template: Template;
  changeable: boolean;
  canCreate: boolean;
  // The name of the template's edition, when the list is showing more than one.
  editionName?: string;
  onClone: (template: Template) => void;
  onOpen: (template: Template) => void;
  onDelete: (template: Template) => void;
}) {
  const {
    template,
    changeable,
    canCreate,
    editionName,
    onClone,
    onOpen,
    onDelete,
  } = props;
  const kind = getTemplateKind(template);
  const name = templateTitle(template);
  const openName = changeable ? "Edit" : "View";

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      alignItems={{ base: "stretch", md: "center" }}
      gap={2}
      padding={2}
      borderWidth={1}
      borderRadius="md"
      // Gray stripes, and a blue highlight under the pointer or the keyboard focus, so that it is
      // clear which row a row's buttons belong to on a wide screen.
      _odd={{ bg: "bg.subtle" }}
      _hover={{ bg: { base: "blue.100", _dark: "blue.900" } }}
      _focusWithin={{
        bg: { base: "blue.100", _dark: "blue.900" },
        borderColor: "blue.500",
      }}
      // A shortcut for the mouse. The Edit button does the same for everyone else.
      onDoubleClick={(e) => {
        if (!(e.target as HTMLElement).closest("button")) onOpen(template);
      }}
      // Where focus goes on from when the template is deleted.
      data-keyboard-select=""
      data-template-id={template.id}
    >
      <Stack direction="row" alignItems="center" gap={3} flex={1} minWidth={0}>
        <Text fontWeight="semibold" flex={1} truncate>
          {name}
        </Text>
        {kind && <Badge>{getKindInfo(kind).label}</Badge>}
        {editionName && (
          <Text fontSize="sm" hideBelow="md">
            {editionName}
          </Text>
        )}
        <Badge colorPalette={SCOPE_COLORS[template.scope]}>
          {SCOPE_LABELS[template.scope]}
        </Badge>
      </Stack>
      <Grid
        templateColumns="repeat(3, 1fr)"
        gap={2}
        width={{ base: "100%", md: "15rem" }}
        css={{ "& > button": { width: "100%" } }}
      >
        <Button
          variant="safe"
          disabled={!canCreate}
          aria-label={`Clone ${name}`}
          onClick={() => onClone(template)}
        >
          Clone
        </Button>
        <Button
          variant="safe"
          aria-label={`${openName} ${name}`}
          onClick={() => onOpen(template)}
        >
          {openName}
        </Button>
        <Button
          variant="unsafe"
          disabled={!changeable}
          aria-label={`Delete ${name}`}
          onClick={() => onDelete(template)}
        >
          Delete
        </Button>
      </Grid>
    </Stack>
  );
});
