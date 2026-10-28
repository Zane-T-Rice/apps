import {
  Figure,
  getFigureName,
} from "../gloomhaven_companion_service/gloomhaven_companion_service_figures";

export const ELEMENTS = [
  "fire",
  "ice",
  "air",
  "earth",
  "light",
  "dark",
] as const;
export type Element = (typeof ELEMENTS)[number];
export type ElementState = "strong" | "waning" | "inert";

export const SECOND_INITIATIVE_PREFIX = "initiative2:";
export const ROUND_KEY = "round";
export const EXTRA_PREFIX = "extra:";
// Set once everyone has an initiative, so a group arriving later does not undo that turns began.
export const STARTED_KEY = "started";
export const DEFER_PREFIX = "defer:";
// Marks a group's turn as joining after a given turn instead of by its initiative.
export const deferKey = (groupKey: string) => `${DEFER_PREFIX}${groupKey}`;
export const elementKey = (element: Element) => `element:${element}`;
// Whether the turn with this id (a group, or a spawn) is over for the round.
export const doneKey = (turnId: string) => `done:${turnId}`;
// Players play two cards. The second card's initiative breaks ties on the first.
export const secondInitiativeKey = (groupKey: string) =>
  groupKey.replace("initiative:", SECOND_INITIATIVE_PREFIX);
// What the table chose when players tie on both cards. Lower goes first.
export const ORDER_PREFIX = "order:";
export const orderKey = (groupKey: string) => `${ORDER_PREFIX}${groupKey}`;
// A standee that does not act this round, such as one that was just summoned. It lasts until the
// round ends, and is saved per figure so it never touches anyone else's.
export const REST_PREFIX = "rest:";
export const restKey = (figureId: string) => `${REST_PREFIX}${figureId}`;
export const INITIATIVE_PREFIX = "initiative:";
export const initiativeKey = (alignment: string, groupClass: string) =>
  `${INITIATIVE_PREFIX}${alignment}:${groupClass}`;

// A group that takes a turn of its own. Summons and NPCs act on someone else's initiative.
// A summon of a player. It acts right before the player, in the order it was summoned.
export type SummonTurn = { id: string; label: string };

export type TurnGroup = {
  key: string;
  label: string;
  alignment: "ally" | "enemy";
  summons?: SummonTurn[];
};

const takesOwnTurn = (figure: Figure) =>
  figure.rank?.toLowerCase() !== "summon" &&
  figure.class?.toLowerCase() !== "wildfury bear" &&
  figure.class?.toLowerCase() !== "npc / obstacle";

// What a figure is called: its class and its nickname, or its name when it has no nickname,
// leaving out whichever is empty.
const figureTitle = (figure: Figure) =>
  [figure.class, getFigureName(figure)].filter((part) => !!part).join(" ");

// The groups that take a turn. Given the state, a group whose standees are all set to not act this
// round is left out, since it needs no initiative and has no turn.
export const collectTurnGroups = (
  figures: Figure[],
  state?: Record<string, string>,
): TurnGroup[] => {
  const groups: { [key: string]: TurnGroup } = {};
  const members: { [key: string]: Figure[] } = {};
  const summons: { [key: string]: Figure[] } = {};
  figures.forEach((figure) => {
    if (state?.[restKey(figure.id)] === "1") return;
    // A player's summon belongs to the player, whose class it carries.
    if (
      figure.alignment === "ally" &&
      figure.rank?.toLowerCase() === "summon"
    ) {
      (summons[initiativeKey("ally", figure.class)] ??= []).push(figure);
      return;
    }
    if (figure.alignment !== "ally" && figure.alignment !== "enemy") return;
    if (!takesOwnTurn(figure)) return;
    const key = initiativeKey(figure.alignment, figure.class);
    groups[key] = { key, label: figure.class, alignment: figure.alignment };
    (members[key] ??= []).push(figure);
  });
  Object.keys(groups).forEach((key) => {
    // A group of one is that figure, so its name goes with its class. A group of several is just
    // its class, since the name of one of them would not be the name of the group.
    if (members[key].length === 1)
      groups[key].label = figureTitle(members[key][0]);
    // Summons go in the order they were summoned, which is the order of their standee numbers.
    groups[key].summons = (summons[key] ?? [])
      .sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity))
      .map((figure) => ({
        id: `summon:${figure.id}`,
        label: figureTitle(figure) || "Summon",
      }));
  });
  return Object.values(groups);
};

export type TurnEntry = TurnGroup & {
  initiative: number;
  second: number | null;
  // The place the table gave this group among the ones tied with it, from 1. Zero when it has not
  // been given one.
  choice: number;
  // Whether this group has gone already.
  done: boolean;
};

const parseOrNull = (value: string | undefined) => {
  const parsed = parseInt(value ?? "");
  return isNaN(parsed) ? null : parsed;
};

// Lowest initiative goes first. On a tie the players go before the enemies. Players tied on the
// first card compare their second card, and if those tie as well, the table chooses. Enemies tied
// on initiative are chosen by the table too.
export const orderTurns = (
  groups: TurnGroup[],
  state: Record<string, string>,
): TurnEntry[] =>
  groups
    .map((group) => ({
      ...group,
      initiative: parseInt(state[group.key]),
      second: parseOrNull(state[secondInitiativeKey(group.key)]),
      choice: parseInt(state[orderKey(group.key)]) || 0,
      done: state[doneKey(group.key)] === "1",
    }))
    .filter((entry) => !isNaN(entry.initiative))
    .sort((a, b) => {
      if (a.initiative !== b.initiative) return a.initiative - b.initiative;
      if (a.alignment !== b.alignment) return a.alignment === "ally" ? -1 : 1;
      if (a.alignment === "ally") {
        // A second card that is not in yet counts as the slowest.
        const secondA = a.second ?? Infinity;
        const secondB = b.second ?? Infinity;
        if (secondA !== secondB) return secondA < secondB ? -1 : 1;
      }
      // Whoever in a tie has gone already stays ahead of those still to go, whatever happens to
      // the places of the ones still to go.
      if (a.done !== b.done) return a.done ? -1 : 1;
      // Groups the table has not placed yet come after the ones it has.
      const choiceA = a.choice || Infinity;
      const choiceB = b.choice || Infinity;
      if (choiceA !== choiceB) return choiceA < choiceB ? -1 : 1;
      // Not the label, which can change when a figure is given a name.
      return a.key.localeCompare(b.key);
    });

export const getRound = (state: Record<string, string>) =>
  parseInt(state[ROUND_KEY]) || 1;

export const getElementState = (
  state: Record<string, string>,
  element: Element,
): ElementState => {
  const value = state[elementKey(element)];
  return value === "strong" || value === "waning" ? value : "inert";
};

// Where a turn that is not in initiative order goes: right after the turn with this id.
type Placement = { after: string; at: number };

// An enemy that spawns after its group has already gone acts once, right after whoever's turn it
// was when it appeared. It is saved under its own extra key so spawns never overwrite each other.
type Spawn = Placement & {
  group: string;
  label: string;
  numbers: number[];
};

const parseJson = (
  value: string | undefined,
): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(value ?? "");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const parsePlacement = (value: string | undefined): Placement | null => {
  const parsed = parseJson(value);
  if (typeof parsed?.after !== "string") return null;
  return { after: parsed.after, at: Number(parsed.at) || 0 };
};

const parseSpawn = (value: string | undefined): Spawn | null => {
  const placement = parsePlacement(value);
  const parsed = parseJson(value);
  if (!placement || typeof parsed?.group !== "string") return null;
  return {
    ...placement,
    group: parsed.group,
    label: String(parsed.label),
    numbers: Array.isArray(parsed.numbers) ? parsed.numbers : [],
  };
};

export type TurnListEntry = {
  // The group's key for a group's own turn, or the extra key for a spawn.
  id: string;
  groupKey: string;
  label: string;
  alignment: "ally" | "enemy";
  initiative: number | null;
  // The second card's initiative, for players.
  second: number | null;
  numbers: number[];
  spawned: boolean;
  // A summon of a player, which acts right before them.
  summon: boolean;
  // A group that got its initiative after its place in the order had passed.
  late: boolean;
  // The turn this one goes right after, for spawns and late groups.
  afterId: string | null;
  // Tied with a group that has not gone yet, so the table may choose who goes first.
  tied: boolean;
  // Whether the table has placed every group tied with this one.
  tieChosen: boolean;
  // This group's place in the tie, once the table has given it one.
  tieRank: number | null;
  done: boolean;
};

// Every turn this round in the order they happen. Spawns and late groups go right after the turn
// they appeared in.
export const buildTurnList = (
  groups: TurnGroup[],
  state: Record<string, string>,
): TurnListEntry[] => {
  const ordered = orderTurns(groups, state);
  // A group that joined after the round started follows the turn that was happening then, but
  // only if its initiative puts it before that turn. Otherwise it is in its place by initiative,
  // and moving its initiative around moves it between the two.
  const orderedIndex = new Map(ordered.map((turn, i) => [turn.key, i]));
  const isLate = (turn: { key: string }) => {
    const placement = parsePlacement(state[deferKey(turn.key)]);
    if (!placement) return false;
    const anchor = orderedIndex.get(placement.after);
    // A turn that is not one of the groups is a spawn, which is always where it was put.
    if (anchor === undefined)
      return parseSpawn(state[placement.after]) !== null;
    return (orderedIndex.get(turn.key) ?? 0) < anchor;
  };

  // The groups still to go that tie with this one: players on both cards, enemies on their one.
  const tiedWith = (turn: (typeof ordered)[number]) =>
    ordered.filter(
      (other) =>
        other.alignment === turn.alignment &&
        state[doneKey(other.key)] !== "1" &&
        other.initiative === turn.initiative &&
        other.second === turn.second,
    );

  // Which place among the tied groups the table gave this one, counting only those still to go.
  const tieRank = (turn: (typeof ordered)[number]) => {
    const peers = tiedWith(turn);
    if (state[doneKey(turn.key)] === "1" || peers.length < 2 || !turn.choice)
      return null;
    return (
      peers
        .filter((other) => other.choice)
        .findIndex((other) => other.key === turn.key) + 1
    );
  };

  const baseEntry = (turn: (typeof ordered)[number]): TurnListEntry => ({
    id: turn.key,
    groupKey: turn.key,
    label: turn.label,
    alignment: turn.alignment,
    initiative: turn.initiative,
    second: turn.second,
    numbers: [],
    spawned: false,
    summon: false,
    afterId: parsePlacement(state[deferKey(turn.key)])?.after ?? null,
    late: isLate(turn),
    tied: state[doneKey(turn.key)] !== "1" && tiedWith(turn).length > 1,
    tieChosen: tiedWith(turn).every((other) => other.choice),
    tieRank: tieRank(turn),
    done: state[doneKey(turn.key)] === "1",
  });

  const later: { id: string; placement: Placement; entry: TurnListEntry }[] =
    [];
  Object.keys(state)
    .filter((key) => key.startsWith(EXTRA_PREFIX))
    .forEach((id) => {
      const spawn = parseSpawn(state[id]);
      if (!spawn) return;
      later.push({
        id,
        placement: spawn,
        entry: {
          id,
          groupKey: spawn.group,
          label: spawn.label,
          alignment: "enemy",
          initiative: null,
          second: null,
          numbers: spawn.numbers,
          spawned: true,
          summon: false,
          afterId: spawn.after,
          late: false,
          tied: false,
          tieChosen: false,
          tieRank: null,
          done: state[doneKey(id)] === "1",
        },
      });
    });
  ordered.filter(isLate).forEach((turn) =>
    later.push({
      id: turn.key,
      placement: parsePlacement(state[deferKey(turn.key)]) as Placement,
      entry: baseEntry(turn),
    }),
  );
  // Spawns act right after the turn they appeared in. Groups that joined late follow them, in
  // initiative order, the same as they would have if they had been there from the start.
  later.sort((a, b) => {
    if (a.entry.spawned !== b.entry.spawned) return a.entry.spawned ? -1 : 1;
    if (!a.entry.spawned && a.entry.initiative !== b.entry.initiative)
      return (a.entry.initiative ?? 0) - (b.entry.initiative ?? 0);
    return a.placement.at - b.placement.at;
  });

  const placed = new Set<string>();
  const list: TurnListEntry[] = [];
  const place = (id: string, entry: TurnListEntry) => {
    placed.add(id);
    // A player's summons act right before them.
    if (!entry.spawned)
      groups
        .find((group) => group.key === entry.groupKey)
        ?.summons?.forEach((summon) =>
          list.push({
            id: summon.id,
            groupKey: entry.groupKey,
            label: summon.label,
            alignment: "ally",
            initiative: null,
            second: null,
            numbers: [],
            spawned: false,
            summon: true,
            afterId: null,
            late: false,
            tied: false,
            tieChosen: false,
            tieRank: null,
            done: state[doneKey(summon.id)] === "1",
          }),
        );
    list.push(entry);
    later
      .filter((l) => l.placement.after === entry.id && !placed.has(l.id))
      .forEach((l) => place(l.id, l.entry));
  };
  ordered
    .filter((turn) => !isLate(turn))
    .forEach((turn) => {
      place(turn.key, baseEntry(turn));
    });
  // Anything whose turn to follow is gone goes last instead of vanishing.
  later.filter((l) => !placed.has(l.id)).forEach((l) => place(l.id, l.entry));
  return list;
};

// Turns have begun once everyone has had an initiative, or anyone has gone. Before then, enemies
// are just being set up.
export const hasRoundStarted = (
  groups: TurnGroup[],
  list: TurnListEntry[],
  state: Record<string, string>,
): boolean =>
  state[STARTED_KEY] === "1" ||
  list.some((turn) => turn.done) ||
  (list.length > 0 &&
    groups.every((group) => list.some((turn) => turn.groupKey === group.key)));

// The turn happening now: the first one that has not gone, or the last one when all have.
const currentTurn = (list: TurnListEntry[]) =>
  list.find((turn) => !turn.done) ?? list[list.length - 1];

// What to save when a player sets a group's initiative. A group that was not in this round's
// order yet and whose initiative has already passed goes right after the current turn instead.
export const planInitiative = (
  groups: TurnGroup[],
  state: Record<string, string>,
  groupKey: string,
  value: string,
): [string, string][] => {
  const entries: [string, string][] = [[groupKey, value]];
  if (value === "") {
    if (state[deferKey(groupKey)]) entries.push([deferKey(groupKey), ""]);
    return entries;
  }

  const list = buildTurnList(groups, state);
  const nextState = { ...state, [groupKey]: value };
  const nextList = buildTurnList(groups, nextState);

  // A group that joins the round after it has started, with no turn of its own yet, is remembered
  // as following whoever's turn it is. Whether that matters is worked out from where its
  // initiative falls (see buildTurnList). A group that was already in the order is just sorted by
  // its new initiative, and the current turn follows, which is how a mistake gets fixed.
  const current = currentTurn(list);
  if (
    hasRoundStarted(groups, list, state) &&
    current &&
    !list.some((turn) => turn.id === groupKey)
  )
    entries.push([
      deferKey(groupKey),
      JSON.stringify({ after: current.id, at: Date.now() }),
    ]);
  if (
    state[STARTED_KEY] !== "1" &&
    hasRoundStarted(groups, nextList, nextState)
  )
    entries.push([STARTED_KEY, "1"]);
  return entries;
};

// What to save so a freshly added enemy whose group has already gone takes a turn right after the
// one happening now. Nothing if its group still has its turn to come, if it has no initiative yet
// (it joins when one is entered), for anything that does not act (summons, NPCs, bosses), or before
// the round has started.
export const planSpawn = (
  groups: TurnGroup[],
  state: Record<string, string>,
  figure: Pick<Figure, "alignment" | "rank" | "class" | "number">,
): [string, string] | null => {
  const rank = figure.rank?.toLowerCase();
  if (figure.alignment !== "enemy" || (rank !== "normal" && rank !== "elite"))
    return null;
  const list = buildTurnList(groups, state);
  if (!hasRoundStarted(groups, list, state)) return null;
  const groupKey = initiativeKey("enemy", figure.class);
  const numbers = figure.number === null ? [] : [figure.number];

  const own = list.filter(
    (turn) => turn.groupKey === groupKey && !turn.spawned,
  );
  if (own.length === 0 || own.some((turn) => !turn.done)) return null;

  // A spawned turn from earlier that has not happened yet takes it along too.
  const existing = list.find(
    (turn) => turn.groupKey === groupKey && turn.spawned && !turn.done,
  );
  if (existing) {
    const spawn = parseSpawn(state[existing.id]) as Spawn;
    return [
      existing.id,
      JSON.stringify({ ...spawn, numbers: [...spawn.numbers, ...numbers] }),
    ];
  }
  const current = currentTurn(list);
  const spawn: Spawn = {
    group: groupKey,
    label: figure.class,
    numbers,
    after: current.id,
    at: Date.now(),
  };
  return [`${EXTRA_PREFIX}${crypto.randomUUID()}`, JSON.stringify(spawn)];
};

// What to save when a tied group is tapped. Tapping the tied groups in the order they go gives each
// the next place, and the last one left takes the last place. Tapping one that already has a place
// starts the tie over.
export const planTieTap = (
  list: TurnListEntry[],
  state: Record<string, string>,
  id: string,
): [string, string][] => {
  const entry = list.find((turn) => turn.id === id);
  if (!entry?.tied) return [];
  // Everyone tied, including the ones that have gone already, in the order they are shown.
  const peers = list.filter(
    (turn) =>
      !turn.spawned &&
      turn.alignment === entry.alignment &&
      turn.initiative === entry.initiative &&
      turn.second === entry.second,
  );
  const tied = peers.filter((turn) => !turn.done);
  const placeOf = (turn: TurnListEntry) =>
    parseInt(state[orderKey(turn.id)]) || 0;

  if (placeOf(entry))
    return tied.filter(placeOf).map((turn) => [orderKey(turn.id), ""]);

  // New places come after every place already given, those of the ones that have gone included,
  // and the ones that have gone are given places of their own so they keep theirs.
  let last = Math.max(0, ...peers.map(placeOf));
  const entries: [string, string][] = [];
  peers
    .filter((turn) => turn.done && !placeOf(turn))
    .forEach((turn) => entries.push([orderKey(turn.id), `${++last}`]));
  entries.push([orderKey(id), `${++last}`]);
  const unplaced = tied.filter((turn) => turn.id !== id && !placeOf(turn));
  if (unplaced.length === 1)
    entries.push([orderKey(unplaced[0].id), `${++last}`]);
  return entries;
};

// What to save so a standee no longer takes part in the spawned turns that have yet to go for its
// group. A spawned turn left with no standees goes away.
const planDropFromSpawns = (
  state: Record<string, string>,
  groupKey: string,
  number: number | null,
): [string, string][] => {
  const entries: [string, string][] = [];
  if (number === null) return entries;
  Object.keys(state).forEach((key) => {
    if (!key.startsWith(EXTRA_PREFIX) || state[doneKey(key)] === "1") return;
    const spawn = parseSpawn(state[key]);
    if (spawn?.group !== groupKey || !spawn.numbers.includes(number)) return;
    const numbers = spawn.numbers.filter((other) => other !== number);
    if (numbers.length > 0) {
      entries.push([key, JSON.stringify({ ...spawn, numbers })]);
    } else {
      entries.push([key, ""]);
      if (state[doneKey(key)]) entries.push([doneKey(key), ""]);
    }
  });
  return entries;
};

// What to save when a standee is set to not act this round, or to act again. One that does not act
// gives up its place in a spawned turn. One that acts again is treated as if it had just spawned,
// so it gets a turn of its own if its group has gone already.
export const planRest = (
  figures: Figure[],
  state: Record<string, string>,
  figure: Figure,
  resting: boolean,
): [string, string][] => {
  const entries: [string, string][] = [
    [restKey(figure.id), resting ? "1" : ""],
  ];
  if (figure.alignment !== "enemy") return entries;
  if (resting) {
    entries.push(
      ...planDropFromSpawns(
        state,
        initiativeKey("enemy", figure.class),
        figure.number,
      ),
    );
  } else {
    // Looked at as it will be, with this standee acting again.
    const next = { ...state, [restKey(figure.id)]: "" };
    const spawn = planSpawn(collectTurnGroups(figures, next), next, figure);
    if (spawn) entries.push(spawn);
  }
  return entries;
};

// What to save when a figure was just removed. A turn spawned for it no longer lists it, and goes
// when it was the last one. Once a group has no figures left it is no longer in the round: its
// initiative, whether it went, and any turns spawned for it are wiped, so enemies of that type that
// show up again are a brand new group that has to draw a card and get an initiative.
export const planFigureRemoved = (
  figures: Figure[],
  state: Record<string, string>,
  removed: Figure,
): [string, string][] => {
  // Later writes to a key replace earlier ones.
  const entries = new Map<string, string>();
  if (state[restKey(removed.id)]) entries.set(restKey(removed.id), "");
  // A summon of a player has a turn of its own that goes with it.
  if (state[doneKey(`summon:${removed.id}`)])
    entries.set(doneKey(`summon:${removed.id}`), "");

  if (
    (removed.alignment === "ally" || removed.alignment === "enemy") &&
    takesOwnTurn(removed)
  ) {
    const groupKey = initiativeKey(removed.alignment, removed.class);
    planDropFromSpawns(state, groupKey, removed.number).forEach(
      ([key, value]) => entries.set(key, value),
    );

    const remaining = figures.filter((figure) => figure.id !== removed.id);
    if (!collectTurnGroups(remaining).some((group) => group.key === groupKey)) {
      [
        groupKey,
        secondInitiativeKey(groupKey),
        doneKey(groupKey),
        deferKey(groupKey),
        orderKey(groupKey),
      ].forEach((key) => {
        if (state[key]) entries.set(key, "");
      });
      Object.keys(state)
        .filter(
          (key) =>
            key.startsWith(EXTRA_PREFIX) &&
            parseSpawn(state[key])?.group === groupKey,
        )
        .forEach((key) => {
          entries.set(key, "");
          if (state[doneKey(key)]) entries.set(doneKey(key), "");
        });
    }
  }
  return [...entries.entries()];
};
