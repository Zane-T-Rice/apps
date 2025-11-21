import { Button } from "../recipes/button";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { useDrawer } from "@/app/utils/use_drawer";
import { ScenarioDrawer } from "./scenario_drawer";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";

export default function EditScenarioButton(props: {
  onEdit: (record: Scenario) => Promise<boolean>;
  templates: Template[];
  scenario?: Scenario;
}) {
  const { onEdit, templates, scenario } = props;
  const { onCreateButton, hasCreatePermission, isCreateOpen, setIsCreateOpen } =
    useDrawer();
  return (
    <>
      <Button
        variant="safe"
        width="100%"
        onClick={() => onCreateButton()}
        disabled={!hasCreatePermission || scenario === undefined}
      >
        Edit Scenario
      </Button>
      <ScenarioDrawer
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        onSubmit={onEdit}
        templates={templates}
        scenario={scenario}
      />
    </>
  );
}
