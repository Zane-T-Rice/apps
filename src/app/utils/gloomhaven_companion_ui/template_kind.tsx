import {
  DEFAULT_EDITION_ID,
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

// What to call a template in a menu. Anything that is not an official template of the default
// edition says where it comes from, so that it can be told apart from the official ones.
export function templateLabel(
  template: Pick<Template, "type" | "scope" | "editionId">,
  editions: Edition[],
  text: string = template.type,
) {
  const hints: string[] = [];
  if (template.editionId !== DEFAULT_EDITION_ID)
    hints.push(getEditionName(editions, template.editionId));
  if (template.scope !== "system") hints.push("custom");
  return hints.length ? `${text} (${hints.join(", ")})` : text;
}
