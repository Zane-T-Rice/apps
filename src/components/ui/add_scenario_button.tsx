import { Button } from "../recipes/button";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { useDrawer } from "@/app/utils/use_drawer";
import { ScenarioDrawer } from "./scenario_drawer";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";

export default function AddScenarioButton(props: {
  onCreate: (record: Scenario) => Promise<boolean>;
  templates: Template[];
}) {
  const { onCreate, templates } = props;
  const { onCreateButton, hasCreatePermission, isCreateOpen, setIsCreateOpen } =
    useDrawer();
  return (
    <>
      <Button
        variant="safe"
        width="100%"
        onClick={() => onCreateButton()}
        disabled={!hasCreatePermission}
      >
        Add Scenario
      </Button>
      <ScenarioDrawer
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        onSubmit={onCreate}
        templates={templates}
      />
    </>
  );
}
