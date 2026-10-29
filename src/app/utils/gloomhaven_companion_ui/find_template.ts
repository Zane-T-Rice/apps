import { Template } from "../gloomhaven_companion_service/gloomhaven_companion_service_templates";

// The template with a name, in an edition. Different editions can have a template of the same
// name. When the edition has none of that name, or is not known, any edition's is used.
export function findTemplate(
  templates: Template[],
  type: string,
  editionId?: string | null,
  matches: (template: Template) => boolean = () => true,
): Template | undefined {
  const named = templates.filter(
    (template) => template.type === type && matches(template),
  );
  return named.find((template) => template.editionId === editionId) ?? named[0];
}
