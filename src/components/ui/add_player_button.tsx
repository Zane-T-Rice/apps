import { Button } from "../recipes/button";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { AddPlayerDrawer } from "./add_player_drawer";
import { useDrawer } from "@/app/utils/use_drawer";

export default function AddPlayerButton(props: {
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
        Add Player
      </Button>
      <AddPlayerDrawer
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        onSubmit={onCreate}
        templates={templates}
      />
    </>
  );
}
