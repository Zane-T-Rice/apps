import { Figure } from "../gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Template } from "../gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { joinStatuses } from "./status_options";
import { getKindInfo, getTemplateKind, TemplateKind } from "./template_kind";

type Rank = "normal" | "elite" | "boss" | "character" | "summon";

// What is typed in for one figure. Everything is text while it is being edited, and a checked box is
// "true".
export type Column = {
  key: keyof Figure;
  label: string;
  input: "number" | "text" | "check";
  kinds: TemplateKind[];
};

const ALL: TemplateKind[] = ["enemy", "boss", "character", "summon"];
const FIGHTERS: TemplateKind[] = ["enemy", "boss", "summon"];

export const COLUMNS: Column[] = [
  { key: "name", label: "Summon name", input: "text", kinds: ["summon"] },
  { key: "maximumHP", label: "HP", input: "number", kinds: ALL },
  { key: "xp", label: "XP", input: "number", kinds: ["character"] },
  { key: "move", label: "Move", input: "number", kinds: FIGHTERS },
  { key: "attack", label: "Attack", input: "number", kinds: FIGHTERS },
  { key: "range", label: "Range", input: "number", kinds: FIGHTERS },
  { key: "target", label: "Target", input: "number", kinds: ["enemy", "boss"] },
  { key: "shield", label: "Shield", input: "number", kinds: FIGHTERS },
  { key: "retaliate", label: "Retaliate", input: "number", kinds: FIGHTERS },
  { key: "pierce", label: "Pierce", input: "number", kinds: FIGHTERS },
  { key: "innateOffenses", label: "Offenses", input: "text", kinds: FIGHTERS },
  { key: "innateDefenses", label: "Defenses", input: "text", kinds: FIGHTERS },
  { key: "special", label: "Special", input: "text", kinds: FIGHTERS },
  { key: "flying", label: "Flying", input: "check", kinds: FIGHTERS },
  { key: "attackPlusC", label: "Attack + C", input: "check", kinds: ["boss"] },
];

export const columnsFor = (kind: TemplateKind) =>
  COLUMNS.filter((column) => column.kinds.includes(kind));

export type FigureDraft = Partial<Record<keyof Figure, string>>;

export type TemplateDraft = {
  type: string;
  kind: TemplateKind;
  editionId: string;
  // Whether it is a system template. Only an admin gets to choose that.
  system: boolean;
  standeeLimit: string;
  figures: Record<string, FigureDraft>;
};

export const figureKey = (level: number, rank: Rank) => `${level}:${rank}`;

const RANK_NAMES: Record<Rank, string> = {
  normal: "Normal",
  elite: "Elite",
  boss: "Boss",
  character: "Character",
  summon: "Summon",
};

export const rankLabel = (rank: Rank) => RANK_NAMES[rank];

export function emptyDraft(
  kind: TemplateKind,
  editionId: string,
  system: boolean,
): TemplateDraft {
  const info = getKindInfo(kind);
  const figures: TemplateDraft["figures"] = {};
  for (const level of info.levels)
    for (const rank of info.ranks) figures[figureKey(level, rank)] = {};
  return {
    type: "",
    kind,
    editionId,
    system,
    standeeLimit: kind === "enemy" ? "10" : "",
    figures,
  };
}

// The text to type in for each column, from a figure that is already there.
function figureToDraft(kind: TemplateKind, figure?: Figure): FigureDraft {
  const draft: FigureDraft = {};
  if (!figure) return draft;
  for (const column of columnsFor(kind)) {
    const value = figure[column.key];
    if (value === null || value === undefined) continue;
    draft[column.key] =
      column.input === "check" ? (value ? "true" : "") : `${value}`;
  }
  return draft;
}

export function draftFromTemplate(
  template: Template,
  system: boolean,
): TemplateDraft {
  const kind = getTemplateKind(template) ?? "enemy";
  const draft = emptyDraft(kind, template.editionId, system);
  draft.type = template.type;
  draft.standeeLimit =
    kind === "enemy" ? `${template.standeeLimit ?? draft.standeeLimit}` : "";
  const info = getKindInfo(kind);
  for (const level of info.levels)
    for (const rank of info.ranks)
      draft.figures[figureKey(level, rank)] = figureToDraft(
        kind,
        template.stats?.[level]?.[rank],
      );
  return draft;
}

// A different kind has different levels and stats, so what was typed in does not carry over.
export function changeKind(draft: TemplateDraft, kind: TemplateKind) {
  return {
    ...emptyDraft(kind, draft.editionId, draft.system),
    type: draft.type,
  };
}

const isWholeNumber = (value: string) => /^\d+$/.test(value.trim());

// The classes a summon's source card can have: a player character, or Item for a card that comes from an item. A summon that is already there
// keeps the source it has.
export function summonSources(templates: Template[], current?: string) {
  const sources = new Set<string>(["Item"]);
  for (const template of templates)
    if (getTemplateKind(template) === "character") sources.add(template.type);
  if (current) sources.add(current);
  return [...sources].sort((a, b) => a.localeCompare(b));
}

const summonName = (figures: Record<string, FigureDraft>) =>
  figures[figureKey(0, "summon")]?.name?.trim().toLowerCase();

// What is wrong with the draft that stops it from being saved. Nothing wrong gives an empty list.
export function validateDraft(
  draft: TemplateDraft,
  templates: Template[],
  editingId?: string,
): string[] {
  const problems: string[] = [];
  const type = draft.type.trim();
  if (!type && draft.kind !== "summon")
    problems.push("Give the template a name.");
  if (!draft.editionId) problems.push("Pick an edition.");
  if (draft.kind === "summon") {
    const editing = templates.find((template) => template.id === editingId);
    if (!summonSources(templates, editing?.type).includes(draft.type))
      problems.push(
        "Pick the class of the source card this summon comes from (a player character, or Item).",
      );
  }

  if (type) {
    const conflict = templates.some((other) => {
      if (other.id === editingId) return false;
      if (other.type.trim().toLowerCase() !== type.toLowerCase()) return false;
      const otherKind = getTemplateKind(other);
      if ((draft.kind === "summon") !== (otherKind === "summon")) return false;
      if (draft.kind !== "summon") return true;
      return (
        other.stats?.[0]?.summon?.name?.trim().toLowerCase() ===
        summonName(draft.figures)
      );
    });
    if (conflict)
      problems.push(
        draft.kind === "summon"
          ? `There is already a summon with that name for ${type}.`
          : `There is already a template named ${type}. Figures in a scenario are found by name, so each name can only be used once.`,
      );
  }

  if (draft.kind === "enemy") {
    const limit = draft.standeeLimit.trim();
    if (!isWholeNumber(limit) || parseInt(limit) < 1)
      problems.push(
        "The standee limit needs to be a whole number of 1 or more.",
      );
  }
  if (draft.kind === "summon" && !summonName(draft.figures))
    problems.push("Give the summon a name.");

  const info = getKindInfo(draft.kind);
  const numberColumns = columnsFor(draft.kind).filter(
    (column) => column.input === "number",
  );
  let missingHP = 0;
  let badNumbers = 0;
  for (const level of info.levels)
    for (const rank of info.ranks) {
      const figure = draft.figures[figureKey(level, rank)] ?? {};
      if (!figure.maximumHP?.trim()) missingHP++;
      for (const column of numberColumns) {
        const value = figure[column.key]?.trim();
        if (value && !isWholeNumber(value)) badNumbers++;
      }
    }
  if (missingHP > 0)
    problems.push(
      `HP is needed for every level (${missingHP} left to fill in).`,
    );
  if (badNumbers > 0)
    problems.push("Stats can only be whole numbers of 0 or more.");
  return problems;
}

// The body to send to the service. Only call this once the draft has no problems.
export function draftToInput(draft: TemplateDraft) {
  const info = getKindInfo(draft.kind);
  const type = draft.type.trim();
  const stats: Template["stats"] = {};
  for (const level of info.levels) {
    stats[level] = {};
    for (const rank of info.ranks) {
      const typed = draft.figures[figureKey(level, rank)] ?? {};
      const figure: Record<string, unknown> = {
        class: type,
        rank: RANK_NAMES[rank],
        damage: 0,
      };
      for (const column of columnsFor(draft.kind)) {
        const value = typed[column.key]?.trim();
        if (!value) continue;
        if (column.input === "number") figure[column.key] = parseInt(value);
        else if (column.input === "check") figure[column.key] = true;
        else if (
          column.key === "innateOffenses" ||
          column.key === "innateDefenses"
        )
          figure[column.key] = joinStatuses([value]);
        else figure[column.key] = value;
      }
      if (draft.kind === "character" && figure.xp === undefined) figure.xp = 0;
      stats[level][rank] = figure as unknown as Figure;
    }
  }
  return {
    type,
    editionId: draft.editionId,
    standeeLimit:
      draft.kind === "enemy" ? parseInt(draft.standeeLimit) : undefined,
    stats,
  };
}
