// The statuses that have a picture (public/<name>.png) or a short text in the figure cards, in the
// order they are offered. Anything else typed in is kept as it is.
// Which of a figure's offenses and defenses a status can be in. Left out, it can be in both.
export type StatusList = "offenses" | "defenses";

export const STATUS_OPTIONS: {
  value: string;
  label: string;
  icon: boolean;
  only?: StatusList;
}[] = [
  { value: "Poison", label: "Poison", icon: true },
  { value: "Wound", label: "Wound", icon: true },
  { value: "Curse", label: "Curse", icon: true },
  { value: "Muddle", label: "Muddle", icon: true },
  { value: "Immobilize", label: "Immobilize", icon: true },
  { value: "Disarm", label: "Disarm", icon: true },
  { value: "Stun", label: "Stun", icon: true },
  { value: "Invisible", label: "Invisible", icon: true },
  { value: "Strengthen", label: "Strengthen", icon: true },
  { value: "Ward", label: "Ward", icon: true },
  { value: "Safeguard", label: "Safeguard", icon: true },
  { value: "Advantage", label: "Advantage", icon: false, only: "offenses" },
  {
    value: "AttackersGainDisadvantage",
    label: "Attackers gain disadvantage",
    icon: false,
    only: "defenses",
  },
];

const canonical = (status: string) =>
  STATUS_OPTIONS.find(
    (option) => option.value.toLowerCase() === status.toLowerCase(),
  )?.value ?? status;

// The statuses in a comma separated list, without blanks or repeats (ignoring case). The ones that
// are known are spelled the way they are offered.
export function parseStatuses(value: string | undefined | null): string[] {
  const seen = new Set<string>();
  const statuses: string[] = [];
  for (const part of (value ?? "").split(",")) {
    const status = canonical(part.trim());
    if (!status || seen.has(status.toLowerCase())) continue;
    seen.add(status.toLowerCase());
    statuses.push(status);
  }
  return statuses;
}

export const joinStatuses = (statuses: string[]) =>
  parseStatuses(statuses.join(",")).join(",");
