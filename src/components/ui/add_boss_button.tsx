import { Button } from "../recipes/button";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { useDrawer } from "@/app/utils/use_drawer";
import { AddBossDrawer } from "./add_boss_drawer";

export default function AddBossButton(props: {
  onCreate: (record: Figure) => Promise<boolean>;
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
        Add Boss
      </Button>
      <AddBossDrawer
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        onSubmit={onCreate}
        templates={templates}
      />
    </>
  );
}
