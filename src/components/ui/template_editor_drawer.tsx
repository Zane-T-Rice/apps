"use client";

import {
  Box,
  chakra,
  Checkbox,
  createListCollection,
  Field,
  Grid,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { Edition } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_editions";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import {
  changeKind,
  type Column,
  columnsFor,
  type FigureDraft,
  figureKey,
  rankLabel,
  summonSources,
  TemplateDraft,
  validateDraft,
} from "@/app/utils/gloomhaven_companion_ui/template_draft";
import {
  getKindInfo,
  TEMPLATE_KINDS,
  TemplateKind,
} from "@/app/utils/gloomhaven_companion_ui/template_kind";
import { Button } from "../recipes/button";
import { DrawerSelect } from "./drawer_select";
import { SharedDrawer } from "./shared_drawer";
import { StatusPicker } from "./status_picker";

// Make or change a template: its name, kind, edition and the stats for each level.
// Mount it when it is wanted. It starts with the draft it is given, and the parent sets `key` so
// that each use starts over.
export function TemplateEditorDrawer(props: {
  title: string;
  initialDraft: TemplateDraft;
  // The template being changed. Left out when making a new one.
  editing?: Template;
  templates: Template[];
  editions: Edition[];
  isAdmin: boolean;
  // For looking at a template that is not the person's to change.
  readOnly?: boolean;
  onClose: () => void;
  onSave: (draft: TemplateDraft) => Promise<boolean>;
}) {
  const {
    title,
    initialDraft,
    editing,
    templates,
    editions,
    isAdmin,
    readOnly,
    onClose,
    onSave,
  } = props;
  const [draft, setDraft] = useState<TemplateDraft>(initialDraft);

  const problems = useMemo(
    () => validateDraft(draft, templates, editing?.id),
    [draft, templates, editing],
  );

  const info = getKindInfo(draft.kind);
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const level = info.levels[Math.min(levelIndex, info.levels.length - 1)];
  const columns = useMemo(() => columnsFor(draft.kind), [draft.kind]);

  // A system template can only be in a system edition. Someone's own template can be in theirs
  // or in a system edition, which keeps it apart from the system's templates there.
  const editionCollection = useMemo(
    () =>
      createListCollection({
        items: editions
          .filter(
            (edition) =>
              edition.scope === "system" ||
              (edition.scope === "mine" && !draft.system),
          )
          .map((edition) => ({
            label:
              edition.scope === "mine"
                ? `${edition.name} (yours)`
                : edition.name,
            value: edition.id,
          })),
      }),
    [editions, draft.system],
  );

  // A summon comes from a source card, whose class is a player character, or Item for a card that comes from an item.
  const sourceCollection = useMemo(
    () =>
      createListCollection({
        items: summonSources(templates, editing?.type).map((source) => ({
          label: source,
          value: source,
        })),
      }),
    [templates, editing],
  );

  const kindCollection = useMemo(
    () =>
      createListCollection({
        items: TEMPLATE_KINDS.map(({ kind, label }) => ({
          label,
          value: kind,
        })),
      }),
    [],
  );

  const setFigureValue = useCallback(
    (key: string, column: string, value: string) =>
      setDraft((prev) => ({
        ...prev,
        figures: {
          ...prev.figures,
          [key]: { ...prev.figures[key], [column]: value },
        },
      })),
    [],
  );

  const body = (
    <Stack
      direction="column"
      gap={5}
      // Enter saves from the text boxes, but on a button or a menu it does its own thing.
      onKeyDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.matches("button, select, [role=combobox]"))
          e.stopPropagation();
      }}
    >
      {!readOnly && problems.length > 0 && (
        <Box role="status" aria-live="polite" fontSize="sm">
          <Text fontWeight="semibold">To save this template:</Text>
          <Box as="ul" paddingLeft={5}>
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </Box>
        </Box>
      )}
      <Stack direction={{ base: "column", md: "row" }} gap={4}>
        {draft.kind === "summon" ? (
          <DrawerSelect
            collection={sourceCollection}
            value={draft.type ? [draft.type] : []}
            setValue={(value) =>
              setDraft((prev) => ({ ...prev, type: value[0] ?? "" }))
            }
            label="Source card class"
            disabled={readOnly}
          />
        ) : (
          <Field.Root required>
            <Field.Label>Name</Field.Label>
            <Input
              value={draft.type}
              readOnly={readOnly}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, type: e.target.value }))
              }
            />
            <Field.HelperText>
              Figures in a scenario are found by this name.
            </Field.HelperText>
          </Field.Root>
        )}
        <DrawerSelect
          collection={kindCollection}
          value={[draft.kind]}
          setValue={(value) =>
            value[0] &&
            setDraft((prev) => changeKind(prev, value[0] as TemplateKind))
          }
          label="Kind"
          // What the stats are for decides the table below, so it is not changed after the fact.
          disabled={!!editing || readOnly}
        />
        <DrawerSelect
          collection={editionCollection}
          value={draft.editionId ? [draft.editionId] : []}
          setValue={(value) =>
            setDraft((prev) => ({ ...prev, editionId: value[0] ?? "" }))
          }
          label="Edition"
          disabled={readOnly}
        />
        {draft.kind === "enemy" && (
          <Field.Root required>
            <Field.Label>Standees</Field.Label>
            <Input
              type="number"
              min={1}
              value={draft.standeeLimit}
              readOnly={readOnly}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, standeeLimit: e.target.value }))
              }
            />
            <Field.HelperText>How many are in the box.</Field.HelperText>
          </Field.Root>
        )}
      </Stack>
      {isAdmin && !editing && !readOnly && (
        <Checkbox.Root
          variant="outline"
          checked={draft.system}
          onCheckedChange={(e) =>
            setDraft((prev) => {
              const system = !!e.checked;
              // Move to an edition it is allowed in, if its own edition is not one.
              const stays =
                !system ||
                editions.find((edition) => edition.id === prev.editionId)
                  ?.scope === "system";
              return {
                ...prev,
                system,
                editionId: stays ? prev.editionId : "",
              };
            })
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label>
            System template (read only for everyone but admins)
          </Checkbox.Label>
        </Checkbox.Root>
      )}
      <Stack
        as="section"
        aria-label="Stats for each level"
        gap={3}
        // Page Up goes to the next level and Page Down to the one before it, from anywhere in the stats.
        onKeyDown={(e) => {
          if (e.key === "PageUp" && levelIndex < info.levels.length - 1) {
            e.preventDefault();
            setLevelIndex(levelIndex + 1);
          } else if (e.key === "PageDown" && levelIndex > 0) {
            e.preventDefault();
            setLevelIndex(levelIndex - 1);
          }
        }}
      >
        {info.levels.length > 1 && (
          <Stack
            direction="row"
            gap={1}
            flexWrap="wrap"
            alignItems="center"
            role="group"
            aria-label="Level"
          >
            <Text fontWeight="semibold" marginRight={2}>
              Level
            </Text>
            {info.levels.map((level, index) => {
              const incomplete = info.ranks.some(
                (rank) => !draft.figures[figureKey(level, rank)]?.maximumHP,
              );
              return (
                <Button
                  key={level}
                  variant={index === levelIndex ? "safe" : "outline"}
                  aria-pressed={index === levelIndex}
                  aria-label={`Level ${level}${incomplete ? ", HP missing" : ""}`}
                  minWidth={9}
                  paddingX={2}
                  onClick={() => setLevelIndex(index)}
                >
                  {level}
                  {incomplete && !readOnly && (
                    <Text as="span" color="orange.500" aria-hidden>
                      *
                    </Text>
                  )}
                </Button>
              );
            })}
          </Stack>
        )}
        {info.levels.length > 1 && !readOnly && (
          <Text fontSize="sm">
            * needs HP. Page Up and Page Down change level.
            {draft.kind === "boss" &&
              " Attack + C: when ticked, the boss adds one to its attack for each character in the scenario, so Attack is the base."}
          </Text>
        )}
        <Stack direction={{ base: "column", lg: "row" }} gap={3}>
          {info.ranks.map((rank) => {
            const key = figureKey(level, rank);
            const rowName = `level ${level}${
              info.ranks.length > 1 ? ` ${rankLabel(rank)}` : ""
            }`;
            return (
              <Box
                as="fieldset"
                // Keyed by rank, not level, so that changing level keeps the focused input.
                key={rank}
                flex={1}
                minWidth={0}
                borderWidth={1}
                borderRadius="md"
                padding={3}
              >
                <chakra.legend paddingX={1} fontWeight="semibold">
                  {rankLabel(rank)}
                </chakra.legend>
                <FigureFields
                  columns={columns}
                  figure={draft.figures[key] ?? {}}
                  readOnly={readOnly}
                  rowName={rowName}
                  onChange={(column, value) =>
                    setFigureValue(key, column, value)
                  }
                />
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <SharedDrawer
      isOpen={true}
      setIsOpen={(open) => !open && onClose()}
      onSubmit={() => onSave(draft)}
      resetFields={() => {}}
      body={body}
      disableSave={problems.length > 0}
      title={title}
      size="xl"
      readOnly={readOnly}
    />
  );
}

// The stats of one figure: the numbers in a grid, then the text boxes and tick boxes.
function FigureFields(props: {
  columns: Column[];
  figure: FigureDraft;
  readOnly?: boolean;
  rowName: string;
  onChange: (column: string, value: string) => void;
}) {
  const { columns, figure, readOnly, rowName, onChange } = props;
  return (
    <Stack gap={3}>
      <Grid
        gap={3}
        templateColumns="repeat(auto-fill, minmax(5.5rem, 1fr))"
        alignItems="end"
      >
        {columns
          .filter((column) => column.input === "number")
          .map((column) => (
            <Field.Root key={column.key} required={column.key === "maximumHP"}>
              <Field.Label>{column.label}</Field.Label>
              <Input
                type="number"
                min={0}
                readOnly={readOnly}
                aria-label={`${column.label}, ${rowName}`}
                value={figure[column.key] ?? ""}
                onChange={(e) => onChange(column.key, e.target.value)}
              />
            </Field.Root>
          ))}
      </Grid>
      {columns
        .filter((column) => column.input === "text")
        .map((column) =>
          column.key === "innateOffenses" || column.key === "innateDefenses" ? (
            <StatusPicker
              key={column.key}
              label={column.label}
              list={column.key === "innateOffenses" ? "offenses" : "defenses"}
              ariaLabel={`${column.label}, ${rowName}`}
              value={figure[column.key] ?? ""}
              readOnly={readOnly}
              onChange={(value) => onChange(column.key, value)}
            />
          ) : (
            <Field.Root key={column.key}>
              <Field.Label>{column.label}</Field.Label>
              <Input
                readOnly={readOnly}
                aria-label={`${column.label}, ${rowName}`}
                value={figure[column.key] ?? ""}
                onChange={(e) => onChange(column.key, e.target.value)}
              />
            </Field.Root>
          ),
        )}
      <Stack direction="row" gap={5} flexWrap="wrap">
        {columns
          .filter((column) => column.input === "check")
          .map((column) => (
            <Checkbox.Root
              key={column.key}
              variant="outline"
              checked={figure[column.key] === "true"}
              disabled={readOnly}
              onCheckedChange={(e) =>
                onChange(column.key, e.checked ? "true" : "")
              }
            >
              <Checkbox.HiddenInput
                aria-label={`${column.label}, ${rowName}`}
              />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label>{column.label}</Checkbox.Label>
            </Checkbox.Root>
          ))}
      </Stack>
    </Stack>
  );
}
