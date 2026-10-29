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
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";
import {
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
import { TemplateRow } from "../ui/template_row";
import { EditionForm } from "../ui/edition_form";
import { removeAndRefocus } from "@/app/utils/keyboard_select";
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
  getTemplateKind,
  SCOPE_COLORS,
  SCOPE_LABELS,
  templateTitle,
  TEMPLATE_KINDS,
} from "@/app/utils/gloomhaven_companion_ui/template_kind";
import { Button } from "../recipes/button";
import { AlertDialog } from "../ui/alert_dialog";
import { TemplateEditorDrawer } from "../ui/template_editor_drawer";

const ALL_EDITIONS = "all";

const SCOPE_ORDER: Scope[] = ["system", "mine", "shared"];

const SCOPE_HEADINGS: Record<Scope, string> = {
  system: "System templates",
  mine: "Your templates",
  shared: "Shared with you by players in your campaigns",
};

// Whether a template can be made in an edition: it is a system one or the person's own.
const usableEdition = (edition?: Edition) =>
  !!edition && (edition.scope === "system" || edition.scope === "mine");

// The edition to put a new template in when nothing better is known: a system one, before the
// person's own.
const firstUsableEdition = (editions: Edition[]) =>
  [...editions]
    .filter(usableEdition)
    .sort(
      (a, b) =>
        SCOPE_ORDER.indexOf(a.scope) - SCOPE_ORDER.indexOf(b.scope) ||
        a.name.localeCompare(b.name),
    )[0];

// Says who can change the templates in a section, where that is not obvious.
const SECTION_NOTES = (scope: Scope, isAdmin: boolean) =>
  scope === "system" && !isAdmin
    ? "Only admins can change these. Clone one to make a copy of your own."
    : scope === "shared"
      ? "Made by other players in your campaigns. You can use and clone them, but only they can change them."
      : "";

type EditorState = {
  key: number;
  mode: "new" | "clone" | "edit" | "view";
  template?: Template;
  draft: TemplateDraft;
};

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
  const [search, setSearch] = useState<string>("");
  // The list follows the search box a little behind it, so that typing is never held up.
  const deferredSearch = useDeferredValue(search);
  const [editor, setEditor] = useState<EditorState | null>(null);
  // The form in the editions menu, when it is making or renaming an edition.
  const [form, setForm] = useState<{ editing?: Edition } | null>(null);
  const editionListRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuFinalFocus = useRestoreFocus(menuOpen);
  const editorCounter = useRef<number>(0);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
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
    return [...editions].sort(
      (a, b) =>
        SCOPE_ORDER.indexOf(a.scope) - SCOPE_ORDER.indexOf(b.scope) ||
        a.name.localeCompare(b.name),
    );
  }, [editions]);

  const selectedEdition = editions.find(
    (edition) => edition.id === selectedEditionId,
  );
  const shownTemplates = useMemo(() => {
    const words = deferredSearch.trim().toLowerCase();
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
  }, [templates, selectedEditionId, deferredSearch]);

  // Your own templates come first when you have any, so they are not buried under the system's.
  const sectionOrder: Scope[] = templates.some(
    (template) => template.scope === "mine",
  )
    ? ["mine", "system", "shared"]
    : SCOPE_ORDER;

  const countInEdition = (editionId: string) =>
    templates.filter((template) => template.editionId === editionId).length;

  const open = useCallback((state: Omit<EditorState, "key">) => {
    editorCounter.current += 1;
    setEditor({ ...state, key: editorCounter.current });
  }, []);

  const onNew = () => {
    const edition = usableEdition(selectedEdition)
      ? selectedEdition
      : firstUsableEdition(editions);
    open({
      mode: "new",
      draft: emptyDraft("enemy", edition?.id ?? "", false),
    });
  };

  const onClone = useCallback(
    (template: Template) => {
      const draft = draftFromTemplate(template, false);
      if (draft.kind === "summon") {
        const figure = draft.figures[figureKey(0, "summon")];
        figure.name = `${figure.name ?? ""} copy`;
      } else {
        draft.type = `${template.type} copy`;
      }
      const edition = editions.find((e) => e.id === template.editionId);
      if (!usableEdition(edition))
        draft.editionId = firstUsableEdition(editions)?.id ?? "";
      open({ mode: "clone", template, draft });
    },
    [editions, open],
  );

  const onEditOrView = useCallback(
    (template: Template) => {
      open({
        mode: canChange(template) ? "edit" : "view",
        template,
        draft: draftFromTemplate(template, template.scope === "system"),
      });
    },
    [canChange, open],
  );

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
      return true;
    }
    const create = draft.system ? createSystemTemplate : createTemplate;
    const created = await fetchWithToast(`Creating ${input.type}`, () =>
      create({ ...input, updatedAt: "" } as Parameters<typeof create>[0]),
    );
    if (!created) return false;
    setTemplates((prev) => [...prev, created]);
    return true;
  };

  const onDeleteTemplate = async (template: Template): Promise<boolean> => {
    const deleted = await fetchWithToast(`Deleting ${template.type}`, () =>
      deleteTemplate({ id: template.id }),
    );
    if (!deleted) return false;
    setTemplates((prev) => prev.filter((other) => other.id !== template.id));
    return true;
  };

  const onSaveEdition = async (
    name: string,
    system: boolean,
    editing?: Edition,
  ): Promise<boolean> => {
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

  const editionCanChange = !!selectedEdition && canChange(selectedEdition);
  const editionHasTemplates =
    !!selectedEdition && countInEdition(selectedEdition.id) > 0;

  const startForm = (editing?: Edition) => setForm({ editing });

  // Back to the list of editions, with the focus on the one that is selected.
  const closeForm = () => {
    setForm(null);
    requestAnimationFrame(() =>
      editionListRef.current
        ?.querySelector<HTMLElement>("[aria-pressed=true]")
        ?.focus(),
    );
  };

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
          // One above the other on a phone, and one row from a tablet up. Every button fills its
          // cell, so that they are all the same size.
          gap={2}
          alignItems="center"
          templateColumns={{
            base: "1fr",
            md: "minmax(0, 14rem) 9rem minmax(8rem, 1fr)",
          }}
          css={{ "& > button": { width: "100%" } }}
        >
          <Button
            variant="outline"
            aria-haspopup="dialog"
            justifyContent="flex-start"
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
          <Input
            aria-label="Search templates"
            placeholder="Search"
            maxWidth={{ md: "16rem" }}
            justifySelf={{ md: "end" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
      </Stack>

      <Drawer.Root
        placement="start"
        open={menuOpen}
        finalFocusEl={menuFinalFocus}
        onOpenChange={(details) => {
          setMenuOpen(details.open);
          if (!details.open) setForm(null);
        }}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>
                  {!form
                    ? "Editions"
                    : form.editing
                      ? "Rename Edition"
                      : "New Edition"}
                </Drawer.Title>
              </Drawer.Header>
              {form ? (
                <EditionForm
                  key={form.editing?.id ?? "new"}
                  editing={form.editing}
                  editions={editions}
                  isAdmin={isAdmin}
                  onSave={onSaveEdition}
                  onDone={closeForm}
                />
              ) : (
                <>
                  <Drawer.Body>
                    <Stack
                      as="nav"
                      aria-label="Editions"
                      gap={2}
                      ref={editionListRef}
                    >
                      <Button
                        variant={
                          selectedEditionId === ALL_EDITIONS
                            ? "safe"
                            : "outline"
                        }
                        aria-pressed={selectedEditionId === ALL_EDITIONS}
                        justifyContent="space-between"
                        onClick={() => setSelectedEditionId(ALL_EDITIONS)}
                      >
                        All editions
                        <Text as="span">{templates.length}</Text>
                      </Button>
                      {sortedEditions.map((edition) => (
                        <Button
                          key={edition.id}
                          variant={
                            selectedEditionId === edition.id
                              ? "safe"
                              : "outline"
                          }
                          aria-pressed={selectedEditionId === edition.id}
                          justifyContent="space-between"
                          onClick={() => setSelectedEditionId(edition.id)}
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
                    <>
                      {editionHasTemplates && editionCanChange && (
                        <Text fontSize="sm">
                          An edition can be deleted once it has no templates in
                          it.
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
                          onClick={() => startForm()}
                        >
                          New edition
                        </Button>
                        <Button
                          variant="outline"
                          disabled={!editionCanChange}
                          onClick={() => startForm(selectedEdition)}
                        >
                          Rename
                        </Button>
                        <AlertDialog
                          titleText="Delete edition?"
                          confirmText="Delete"
                          body={
                            <Text>
                              Delete the edition {selectedEdition?.name}?
                            </Text>
                          }
                          onConfirm={() =>
                            selectedEdition && onDeleteEdition(selectedEdition)
                          }
                          trigger={
                            <Button
                              variant="unsafe"
                              disabled={
                                !editionCanChange || editionHasTemplates
                              }
                            >
                              Delete
                            </Button>
                          }
                        />
                      </Grid>
                    </>
                  </Drawer.Footer>
                </>
              )}
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
              {SECTION_NOTES(scope, isAdmin) && (
                <Text fontSize="sm">{SECTION_NOTES(scope, isAdmin)}</Text>
              )}
              {inScope.map((template) => (
                <TemplateRow
                  key={template.id}
                  template={template}
                  changeable={canChange(template)}
                  canCreate={canCreate}
                  editionName={
                    selectedEditionId === ALL_EDITIONS
                      ? getEditionName(editions, template.editionId)
                      : undefined
                  }
                  onClone={onClone}
                  onOpen={onEditOrView}
                  onDelete={setDeleteTarget}
                />
              ))}
            </Stack>
          );
        })}
      </Stack>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        titleText="Delete template?"
        confirmText="Delete"
        body={
          <Text>Delete {deleteTarget && templateTitle(deleteTarget)}?</Text>
        }
        onConfirm={() => {
          const template = deleteTarget;
          if (!template) return;
          const row = document.querySelector<HTMLElement>(
            `[data-template-id="${template.id}"]`,
          );
          if (row) removeAndRefocus(row, () => onDeleteTemplate(template));
          else onDeleteTemplate(template);
        }}
      />
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
    </Stack>
  );
}
