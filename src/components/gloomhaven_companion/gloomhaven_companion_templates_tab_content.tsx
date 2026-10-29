"use client";

import {
  Badge,
  CloseButton,
  Drawer,
  Grid,
  Heading,
  Input,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_EDITION_ID,
  Scope,
  Template,
  useSystemTemplates,
  useTemplates,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import {
  Edition,
  useEditions,
  useSystemEditions,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_editions";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { fetchWithToast } from "@/app/utils/fetch/fetch_with_toast";
import { keyboardSelectProps } from "@/app/utils/keyboard_select";
import { usePermissions } from "@/app/utils/use_permissions";
import { useRestoreFocus } from "@/app/utils/use_restore_focus";
import {
  draftFromTemplate,
  draftToInput,
  emptyDraft,
  figureKey,
  TemplateDraft,
} from "@/app/utils/gloomhaven_companion_ui/template_draft";
import {
  getEditionName,
  getKindInfo,
  getTemplateKind,
  SCOPE_LABELS,
  TEMPLATE_KINDS,
} from "@/app/utils/gloomhaven_companion_ui/template_kind";
import { Button } from "../recipes/button";
import { AlertDialog } from "../ui/alert_dialog";
import { EditionDrawer } from "../ui/edition_drawer";
import { TemplateEditorDrawer } from "../ui/template_editor_drawer";

const ALL_EDITIONS = "all";

const SCOPE_ORDER: Scope[] = ["system", "mine", "shared"];

const SCOPE_HEADINGS: Record<Scope, string> = {
  system: "System templates",
  mine: "Your templates",
  shared: "Shared with you by players in your campaigns",
};

const SCOPE_COLORS: Record<Scope, string> = {
  system: "blue",
  mine: "green",
  shared: "purple",
};

type EditorState = {
  key: number;
  mode: "new" | "clone" | "edit" | "view";
  template?: Template;
  draft: TemplateDraft;
};

type EditionState = { key: number; editing?: Edition };

export function GloomhavenCompanionTemplatesTabContent(props: {
  templates: Template[];
  setTemplates: Dispatch<SetStateAction<Template[]>>;
  editions: Edition[];
  setEditions: Dispatch<SetStateAction<Edition[]>>;
  // Fetches everything again, for when what is on screen turns out to be out of date.
  reload: () => Promise<void>;
}) {
  const { templates, setTemplates, editions, setEditions, reload } = props;
  const [selectedEditionId, setSelectedEditionId] =
    useState<string>(ALL_EDITIONS);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [search, setSearch] = useState<string>("");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [editionState, setEditionState] = useState<EditionState | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuFinalFocus = useRestoreFocus(menuOpen);
  const [counter, setCounter] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [canCreate, setCanCreate] = useState<boolean>(false);

  const { hasPermissions } = usePermissions();
  const {
    createREST: createTemplate,
    editREST: editTemplate,
    deleteREST: deleteTemplate,
  } = useTemplates(responseTransformer);
  const { createREST: createSystemTemplate } =
    useSystemTemplates(responseTransformer);
  const {
    createREST: createEdition,
    editREST: editEdition,
    deleteREST: deleteEdition,
  } = useEditions(responseTransformer);
  const { createREST: createSystemEdition } =
    useSystemEditions(responseTransformer);

  useEffect(() => {
    const getPermissions = async () => {
      const admin = !!(await hasPermissions(["gloomhaven-companion:admin"]));
      const isPublic = !!(await hasPermissions([
        "gloomhaven-companion:public",
      ]));
      setIsAdmin(admin);
      setCanCreate(admin || isPublic);
    };
    getPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canChange = useCallback(
    (item: { scope: Scope }) =>
      item.scope === "mine" || (item.scope === "system" && isAdmin),
    [isAdmin],
  );

  const sortedEditions = useMemo(() => {
    const rank = (edition: Edition) =>
      edition.id === DEFAULT_EDITION_ID
        ? -1
        : SCOPE_ORDER.indexOf(edition.scope);
    return [...editions].sort(
      (a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name),
    );
  }, [editions]);

  const selectedEdition = editions.find(
    (edition) => edition.id === selectedEditionId,
  );
  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId,
  );

  const shownTemplates = useMemo(() => {
    const words = search.trim().toLowerCase();
    return templates
      .filter(
        (template) =>
          (selectedEditionId === ALL_EDITIONS ||
            template.editionId === selectedEditionId) &&
          (!words ||
            template.type.toLowerCase().includes(words) ||
            (template.stats?.[0]?.summon?.name ?? "")
              .toLowerCase()
              .includes(words)),
      )
      .sort((a, b) => {
        const kinds = TEMPLATE_KINDS.map((info) => info.kind);
        return (
          kinds.indexOf(getTemplateKind(a) ?? "enemy") -
            kinds.indexOf(getTemplateKind(b) ?? "enemy") ||
          a.type.localeCompare(b.type)
        );
      });
  }, [templates, selectedEditionId, search]);

  // Your own templates come first when you have any, so they are not buried under the system's.
  const sectionOrder: Scope[] = templates.some(
    (template) => template.scope === "mine",
  )
    ? ["mine", "system", "shared"]
    : SCOPE_ORDER;

  const chooseEdition = (editionId: string) => {
    setSelectedEditionId(editionId);
    setMenuOpen(false);
  };

  const countInEdition = (editionId: string) =>
    templates.filter((template) => template.editionId === editionId).length;

  // Whether a template can be made in an edition: the edition is a system one or the person's own.
  const usableEdition = (edition?: Edition) =>
    edition && (edition.scope === "system" || edition.scope === "mine");

  const open = (state: Omit<EditorState, "key">) => {
    setCounter((prev) => prev + 1);
    setEditor({ ...state, key: counter });
  };

  const onNew = () => {
    const editionId = usableEdition(selectedEdition)
      ? selectedEdition!.id
      : DEFAULT_EDITION_ID;
    open({ mode: "new", draft: emptyDraft("enemy", editionId, false) });
  };

  const onClone = (template: Template) => {
    const draft = draftFromTemplate(template, false);
    if (draft.kind === "summon") {
      const figure = draft.figures[figureKey(0, "summon")];
      figure.name = `${figure.name ?? ""} copy`;
    } else {
      draft.type = `${template.type} copy`;
    }
    const edition = editions.find((e) => e.id === template.editionId);
    if (!usableEdition(edition)) draft.editionId = DEFAULT_EDITION_ID;
    open({ mode: "clone", template, draft });
  };

  const onEditOrView = (template: Template) => {
    open({
      mode: canChange(template) ? "edit" : "view",
      template,
      draft: draftFromTemplate(template, template.scope === "system"),
    });
  };

  const onSaveTemplate = async (draft: TemplateDraft): Promise<boolean> => {
    const input = draftToInput(draft);
    const editing = editor?.mode === "edit" ? editor.template : undefined;
    if (editing) {
      const saved = await fetchWithToast(`Editing ${input.type}`, () =>
        editTemplate({
          ...input,
          id: editing.id,
          updatedAt: editing.updatedAt,
        } as Parameters<typeof editTemplate>[0]),
      );
      if (!saved) {
        // Usually the template was changed since it was loaded.
        await reload();
        return false;
      }
      setTemplates((prev) =>
        prev.map((template) => (template.id === saved.id ? saved : template)),
      );
      setSelectedTemplateId(saved.id);
      return true;
    }
    const create = draft.system ? createSystemTemplate : createTemplate;
    const created = await fetchWithToast(`Creating ${input.type}`, () =>
      create({ ...input, updatedAt: "" } as Parameters<typeof create>[0]),
    );
    if (!created) return false;
    setTemplates((prev) => [...prev, created]);
    setSelectedTemplateId(created.id);
    return true;
  };

  const onDeleteTemplate = async (template: Template) => {
    const deleted = await fetchWithToast(`Deleting ${template.type}`, () =>
      deleteTemplate({ id: template.id }),
    );
    if (!deleted) return;
    setTemplates((prev) => prev.filter((other) => other.id !== template.id));
    setSelectedTemplateId(undefined);
  };

  const onSaveEdition = async (
    name: string,
    system: boolean,
  ): Promise<boolean> => {
    const editing = editionState?.editing;
    if (editing) {
      const saved = await fetchWithToast(`Renaming ${editing.name}`, () =>
        editEdition({
          id: editing.id,
          name,
          updatedAt: editing.updatedAt,
        } as Parameters<typeof editEdition>[0]),
      );
      if (!saved) {
        await reload();
        return false;
      }
      setEditions((prev) =>
        prev.map((edition) => (edition.id === saved.id ? saved : edition)),
      );
      return true;
    }
    const create = system ? createSystemEdition : createEdition;
    const created = await fetchWithToast(`Creating ${name}`, () =>
      create({ name, updatedAt: null } as Parameters<typeof create>[0]),
    );
    if (!created) return false;
    setEditions((prev) => [...prev, created]);
    setSelectedEditionId(created.id);
    return true;
  };

  const onDeleteEdition = async (edition: Edition) => {
    const deleted = await fetchWithToast(`Deleting ${edition.name}`, () =>
      deleteEdition({ id: edition.id }),
    );
    if (!deleted) return;
    setEditions((prev) => prev.filter((other) => other.id !== edition.id));
    setSelectedEditionId(ALL_EDITIONS);
  };

  const editionCanChange =
    !!selectedEdition &&
    selectedEdition.id !== DEFAULT_EDITION_ID &&
    canChange(selectedEdition);
  const editionHasTemplates =
    !!selectedEdition && countInEdition(selectedEdition.id) > 0;

  // Says why a button is turned off, which is not otherwise visible.
  const templateHint = !selectedTemplate
    ? "Select a template to clone, view or change it."
    : selectedTemplate.scope === "system" && !isAdmin
      ? "System templates can only be changed by admins. Clone it to make a copy of your own."
      : selectedTemplate.scope === "shared"
        ? "This was made by another player in one of your campaigns. You can use it and clone it, but only they can change it."
        : "";

  const editionButtonName = selectedEdition?.name ?? "All editions";

  return (
    <Stack gap={3} marginLeft={3} marginRight={3}>
      <Stack
        // Stays in view under the tab bar while the list scrolls.
        position="sticky"
        top="var(--navigation-bar-height, 0px)"
        zIndex={900}
        bg={{ base: "white", _dark: "black" }}
        paddingY={2}
        gap={1}
      >
        <Grid
          // Two by two on a phone, with the edition and the search above and below, and one row
          // from a tablet up. Every button fills its cell, so that they are all the same size.
          gap={2}
          alignItems="center"
          templateColumns={{
            base: "repeat(2, 1fr)",
            md: "minmax(0, 14rem) repeat(4, 6.5rem) minmax(8rem, 1fr)",
          }}
          css={{ "& > button": { width: "100%" } }}
        >
          <Button
            variant="outline"
            aria-haspopup="dialog"
            justifyContent="flex-start"
            gridColumn={{ base: "1 / -1", md: "auto" }}
            minWidth={0}
            onClick={() => setMenuOpen(true)}
          >
            <GiHamburgerMenu />
            <Text as="span" truncate>
              Editions: {editionButtonName}
            </Text>
          </Button>
          <Button variant="safe" disabled={!canCreate} onClick={onNew}>
            New template
          </Button>
          <Button
            variant="outline"
            disabled={!selectedTemplate || !canCreate}
            onClick={() => selectedTemplate && onClone(selectedTemplate)}
          >
            Clone
          </Button>
          <Button
            variant="outline"
            disabled={!selectedTemplate}
            onClick={() => selectedTemplate && onEditOrView(selectedTemplate)}
          >
            {selectedTemplate && !canChange(selectedTemplate) ? "View" : "Edit"}
          </Button>
          <AlertDialog
            titleText="Delete template?"
            confirmText="Delete"
            body={<Text>Delete {selectedTemplate?.type}?</Text>}
            onConfirm={() =>
              selectedTemplate && onDeleteTemplate(selectedTemplate)
            }
            trigger={
              <Button
                variant="unsafe"
                disabled={!selectedTemplate || !canChange(selectedTemplate)}
              >
                Delete
              </Button>
            }
          />
          <Input
            aria-label="Search templates"
            placeholder="Search"
            maxWidth={{ md: "16rem" }}
            justifySelf={{ md: "end" }}
            gridColumn={{ base: "1 / -1", md: "auto" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Text fontSize="sm" aria-live="polite">
          {templateHint}
        </Text>
      </Stack>

      <Drawer.Root
        placement="start"
        open={menuOpen}
        finalFocusEl={menuFinalFocus}
        onOpenChange={(details) => setMenuOpen(details.open)}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Editions</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <Stack as="nav" aria-label="Editions" gap={2}>
                  <Button
                    variant={
                      selectedEditionId === ALL_EDITIONS ? "safe" : "outline"
                    }
                    aria-pressed={selectedEditionId === ALL_EDITIONS}
                    justifyContent="space-between"
                    onClick={() => chooseEdition(ALL_EDITIONS)}
                  >
                    All editions
                    <Text as="span">{templates.length}</Text>
                  </Button>
                  {sortedEditions.map((edition) => (
                    <Button
                      key={edition.id}
                      variant={
                        selectedEditionId === edition.id ? "safe" : "outline"
                      }
                      aria-pressed={selectedEditionId === edition.id}
                      justifyContent="space-between"
                      onClick={() => chooseEdition(edition.id)}
                    >
                      <Text as="span" truncate>
                        {edition.name}
                      </Text>
                      <Text as="span">
                        {edition.scope !== "system" && (
                          <Badge
                            marginRight={2}
                            colorPalette={SCOPE_COLORS[edition.scope]}
                          >
                            {SCOPE_LABELS[edition.scope]}
                          </Badge>
                        )}
                        {countInEdition(edition.id)}
                      </Text>
                    </Button>
                  ))}
                </Stack>
              </Drawer.Body>
              <Drawer.Footer flexDirection="column" alignItems="stretch">
                {editionHasTemplates && editionCanChange && (
                  <Text fontSize="sm">
                    An edition can be deleted once it has no templates in it.
                  </Text>
                )}
                <Grid
                  gap={2}
                  templateColumns="repeat(3, 1fr)"
                  css={{ "& > button": { width: "100%" } }}
                >
                  <Button
                    variant="safe"
                    disabled={!canCreate}
                    onClick={() => {
                      setMenuOpen(false);
                      setCounter((prev) => prev + 1);
                      setEditionState({ key: counter });
                    }}
                  >
                    New edition
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!editionCanChange}
                    onClick={() => {
                      setMenuOpen(false);
                      setCounter((prev) => prev + 1);
                      setEditionState({
                        key: counter,
                        editing: selectedEdition,
                      });
                    }}
                  >
                    Rename
                  </Button>
                  <AlertDialog
                    titleText="Delete edition?"
                    confirmText="Delete"
                    body={
                      <Text>Delete the edition {selectedEdition?.name}?</Text>
                    }
                    onConfirm={() =>
                      selectedEdition && onDeleteEdition(selectedEdition)
                    }
                    trigger={
                      <Button
                        variant="unsafe"
                        disabled={!editionCanChange || editionHasTemplates}
                      >
                        Delete
                      </Button>
                    }
                  />
                </Grid>
              </Drawer.Footer>
              <Drawer.CloseTrigger asChild justifyItems="center">
                <CloseButton size="sm" marginTop={2} />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      <Stack gap={3} flex={1} minWidth={0} width="100%">
        {shownTemplates.length === 0 && (
          <Text>
            {templates.length === 0
              ? "There are no templates yet."
              : "No templates match."}
          </Text>
        )}
        {sectionOrder.map((scope) => {
          const inScope = shownTemplates.filter(
            (template) => template.scope === scope,
          );
          if (inScope.length === 0) return null;
          return (
            <Stack
              as="section"
              key={scope}
              gap={1}
              aria-label={SCOPE_HEADINGS[scope]}
            >
              <Heading as="h3" size="sm">
                {SCOPE_HEADINGS[scope]}
              </Heading>
              {inScope.map((template) => {
                const kind = getTemplateKind(template);
                const selected = template.id === selectedTemplateId;
                return (
                  <Stack
                    key={template.id}
                    direction="row"
                    alignItems="center"
                    gap={3}
                    padding={2}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor={selected ? "green.500" : "border"}
                    bg={
                      selected
                        ? { base: "green.50", _dark: "green.950" }
                        : undefined
                    }
                    cursor="pointer"
                    role="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedTemplateId(template.id)}
                    onDoubleClick={() => onEditOrView(template)}
                    {...keyboardSelectProps(() =>
                      setSelectedTemplateId(template.id),
                    )}
                    // Space only selects. Enter selects and opens it, as double clicking does.
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === " ") {
                        e.preventDefault();
                        setSelectedTemplateId(template.id);
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        setSelectedTemplateId(template.id);
                        onEditOrView(template);
                      }
                    }}
                    _focusVisible={{
                      outline: "2px solid",
                      outlineColor: "blue.500",
                    }}
                  >
                    <Text fontWeight="semibold" flex={1} truncate>
                      {template.type}
                      {kind === "summon" &&
                        ` – ${template.stats?.[0]?.summon?.name ?? ""}`}
                    </Text>
                    {kind && <Badge>{getKindInfo(kind).label}</Badge>}
                    {selectedEditionId === ALL_EDITIONS && (
                      <Text fontSize="sm" hideBelow="md">
                        {getEditionName(editions, template.editionId)}
                      </Text>
                    )}
                    <Badge colorPalette={SCOPE_COLORS[template.scope]}>
                      {SCOPE_LABELS[template.scope]}
                    </Badge>
                  </Stack>
                );
              })}
            </Stack>
          );
        })}
      </Stack>

      {editor && (
        <TemplateEditorDrawer
          key={editor.key}
          title={
            editor.mode === "new"
              ? "New Template"
              : editor.mode === "clone"
                ? `Clone ${editor.template?.type}`
                : editor.mode === "edit"
                  ? `Edit ${editor.template?.type}`
                  : `${editor.template?.type}`
          }
          initialDraft={editor.draft}
          editing={editor.mode === "edit" ? editor.template : undefined}
          templates={templates}
          editions={editions}
          isAdmin={isAdmin}
          readOnly={editor.mode === "view"}
          onClose={() => setEditor(null)}
          onSave={onSaveTemplate}
        />
      )}
      {editionState && (
        <EditionDrawer
          key={editionState.key}
          editing={editionState.editing}
          editions={editions}
          isAdmin={isAdmin}
          onClose={() => setEditionState(null)}
          onSave={onSaveEdition}
        />
      )}
    </Stack>
  );
}
