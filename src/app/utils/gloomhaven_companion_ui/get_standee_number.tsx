import { Group } from "@/components/gloomhaven_companion/gloomhaven_companion_allies_enemies_tab_content";
import { Figure } from "../gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Template } from "../gloomhaven_companion_service/gloomhaven_companion_service_templates";

// Return -1 if no more standees are available.
// Return null if no standee number is needed.
// Return number if a standee number is generated.
export const getStandeeNumber = (
  figure: Figure,
  groups: Group[],
  templates: Template[],
): number | null => {
  let result = null;
  if (
    figure.rank?.toLowerCase() === "summon" ||
    figure.rank?.toLowerCase() === "boss" ||
    figure.class?.toLowerCase() === "wildfury bear" ||
    figure.class?.toLowerCase() === "npc / obstacle"
  ) {
    // Summons, Bosses, NPCs, and Obstacles get the next highest standee number.
    const group = groups.find((figures) => figures.class === figure.class);
    if (group === undefined) return 1;
    const currentStandeeNumbers = group.figures
      .map((figure) => figure.number)
      .filter((number) => number !== null && number !== undefined)
      .sort();
    let i = currentStandeeNumbers.length
      ? currentStandeeNumbers[currentStandeeNumbers.length - 1]
      : 1;
    while (currentStandeeNumbers.indexOf(i) !== -1) i++;
    result = i;
  } else if (
    figure.rank?.toLowerCase() === "normal" ||
    figure.rank?.toLowerCase() === "elite"
  ) {
    // Enemies get a random available standee number.
    const template: Template | undefined = templates.find(
      (template) => template.type === figure.class,
    );
    if (template) {
      const group = groups.find((group) => group.class === figure.class);
      const currentStandeeNumbers = group?.figures.map(
        (figure) => figure.number,
      );
      const standeeNumbers = new Array(template.standeeLimit)
        .fill(0)
        .map((_, index) => index + 1)
        .filter((standeeNumber) => {
          if (currentStandeeNumbers) {
            return !currentStandeeNumbers.some(
              (sNumber) => sNumber === standeeNumber,
            );
          } else {
            return true;
          }
        });
      if (standeeNumbers.length > 0) {
        const standeeNumber =
          standeeNumbers[Math.floor(Math.random() * standeeNumbers.length)];
        result = standeeNumber;
      } else {
        // There are no more standees available for this monster type.
        result = -1;
      }
    }
  }
  return result;
};
