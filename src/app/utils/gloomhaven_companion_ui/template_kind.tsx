import {
  Scope,
  Template,
} from "../gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { Edition } from "../gloomhaven_companion_service/gloomhaven_companion_service_editions";

// What a template makes. Each is added from a different button in the app.
export type TemplateKind = "enemy" | "boss" | "character" | "summon";

export const TEMPLATE_KINDS: {
  kind: TemplateKind;
  label: string;
  plural: string;
  // The levels that the stats are given for.
  levels: number[];
  // The figures in each level, in the order that they are shown.
  ranks: ("normal" | "elite" | "boss" | "character" | "summon")[];
}[] = [
  {
    kind: "enemy",
    label: "Enemy",
    plural: "Enemies",
    levels: [0, 1, 2, 3, 4, 5, 6, 7],
    ranks: ["normal", "elite"],
  },
  {
    kind: "boss",
    label: "Boss",
    plural: "Bosses",
    levels: [0, 1, 2, 3, 4, 5, 6, 7],
    ranks: ["boss"],
  },
  {
    kind: "character",
    label: "Player character",
    plural: "Player characters",
    levels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    ranks: ["character"],
  },
  {
    kind: "summon",
    label: "Summon",
    plural: "Summons",
    levels: [0],
    ranks: ["summon"],
  },
];

export const getKindInfo = (kind: TemplateKind) =>
  TEMPLATE_KINDS.find((info) => info.kind === kind)!;

export function getTemplateKind(template: Template): TemplateKind | undefined {
  const stats = Object.values(template.stats ?? {});
  if (stats.some((level) => level.normal || level.elite)) return "enemy";
  if (stats.some((level) => level.boss)) return "boss";
  if (stats.some((level) => level.character)) return "character";
  if (stats.some((level) => level.summon)) return "summon";
  return undefined;
}

export const SCOPE_LABELS: Record<Scope, string> = {
  system: "System",
  mine: "Yours",
  shared: "Shared",
};

export const getEditionName = (editions: Edition[], editionId: string) =>
  editions.find((edition) => edition.id === editionId)?.name ?? "Unknown";

// What to call a template in a menu. It says which edition it is in when another edition has a
// template of the same name, and anything that is not a system template says it is custom, so that
// it can be told apart from the official ones.
export function templateLabel(
  template: Pick<Template, "type" | "scope" | "editionId">,
  editions: Edition[],
  templates: Pick<Template, "type" | "editionId">[],
  text: string = template.type,
) {
  const hints: string[] = [];
  if (
    templates.some(
      (other) =>
        other.type === template.type && other.editionId !== template.editionId,
    )
  )
    hints.push(getEditionName(editions, template.editionId));
  if (template.scope !== "system") hints.push("custom");
  return hints.length ? `${text} (${hints.join(", ")})` : text;
}

export const SCOPE_COLORS: Record<Scope, string> = {
  system: "blue",
  mine: "green",
  shared: "purple",
};

// What to call a template on screen. A summon is named by its card and by its own name.
export function templateTitle(template: Template) {
  return getTemplateKind(template) === "summon"
    ? `${template.type} – ${template.stats?.[0]?.summon?.name ?? ""}`
    : template.type;
}
