"use client";

import {
  Box,
  chakra,
  Checkbox,
  createListCollection,
  Field,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { Edition } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_editions";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import {
  changeKind,
  columnsFor,
  copyLevel,
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
      {/* Scrolls on its own, so that its horizontal scrollbar is always on screen instead of at the
          bottom of a table that is taller than the drawer. */}
      <Box overflow="auto" maxHeight="max(20rem, calc(100dvh - 24rem))">
        <chakra.table
          fontSize="sm"
          width="100%"
          css={{
            "& thead th": {
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: "var(--chakra-colors-bg)",
            },
          }}
        >
          <caption style={{ textAlign: "left", paddingBottom: 8 }}>
            Stats for each level. Tab moves along a row.
            {draft.kind === "boss" &&
              " Attack + C: when ticked, the boss adds one to its attack for each character in the scenario, so Attack is the base."}
          </caption>
          <thead>
            <tr>
              <chakra.th textAlign="left" padding={1} scope="col">
                Level
              </chakra.th>
              {info.ranks.length > 1 && (
                <chakra.th textAlign="left" padding={1} scope="col">
                  Rank
                </chakra.th>
              )}
              {columns.map((column) => (
                <chakra.th
                  key={column.key}
                  textAlign="left"
                  padding={1}
                  scope="col"
                >
                  {column.label}
                </chakra.th>
              ))}
              {!readOnly && info.levels.length > 1 && (
                <chakra.th padding={1} scope="col">
                  <Box srOnly>Copy</Box>
                </chakra.th>
              )}
            </tr>
          </thead>
          <tbody>
            {info.levels.map((level, levelIndex) =>
              info.ranks.map((rank, rankIndex) => {
                const key = figureKey(level, rank);
                const figure = draft.figures[key] ?? {};
                const rowName = `level ${level}${
                  info.ranks.length > 1 ? ` ${rankLabel(rank)}` : ""
                }`;
                return (
                  <tr key={key}>
                    {rankIndex === 0 && (
                      <chakra.th
                        scope="row"
                        rowSpan={info.ranks.length}
                        textAlign="left"
                        padding={1}
                        verticalAlign="top"
                      >
                        {level}
                      </chakra.th>
                    )}
                    {info.ranks.length > 1 && (
                      <chakra.td padding={1}>{rankLabel(rank)}</chakra.td>
                    )}
                    {columns.map((column) => (
                      <chakra.td key={column.key} padding={1}>
                        {column.input === "check" ? (
                          <Checkbox.Root
                            variant="outline"
                            checked={figure[column.key] === "true"}
                            disabled={readOnly}
                            onCheckedChange={(e) =>
                              setFigureValue(
                                key,
                                column.key,
                                e.checked ? "true" : "",
                              )
                            }
                          >
                            <Checkbox.HiddenInput
                              aria-label={`${column.label}, ${rowName}`}
                            />
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox.Root>
                        ) : (
                          <Input
                            aria-label={`${column.label}, ${rowName}`}
                            type={column.input === "number" ? "number" : "text"}
                            min={column.input === "number" ? 0 : undefined}
                            readOnly={readOnly}
                            minWidth={
                              column.input === "number" ? "4.5rem" : "9rem"
                            }
                            value={figure[column.key] ?? ""}
                            onChange={(e) =>
                              setFigureValue(key, column.key, e.target.value)
                            }
                          />
                        )}
                      </chakra.td>
                    ))}
                    {!readOnly && info.levels.length > 1 && (
                      <chakra.td padding={1}>
                        {rankIndex === 0 && levelIndex > 0 && (
                          <Button
                            variant="outline"
                            height="auto"
                            paddingX={2}
                            paddingY={1}
                            fontSize="xs"
                            onClick={() =>
                              setDraft((prev) =>
                                copyLevel(
                                  prev,
                                  info.levels[levelIndex - 1],
                                  level,
                                ),
                              )
                            }
                          >
                            Copy level {info.levels[levelIndex - 1]}
                            <Box srOnly> into level {level}</Box>
                          </Button>
                        )}
                      </chakra.td>
                    )}
                  </tr>
                );
              }),
            )}
          </tbody>
        </chakra.table>
      </Box>
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
