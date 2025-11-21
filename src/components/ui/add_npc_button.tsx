import { Button } from "../recipes/button";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { useDrawer } from "@/app/utils/use_drawer";
import { AddNPCDrawer } from "./add_npc_drawer";

export default function AddNPCButton(props: {
  onCreate: (record: Figure) => Promise<boolean>;
  alignment: string;
}) {
  const { onCreate, alignment } = props;
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
        Add NPC / Obstacle
      </Button>
      <AddNPCDrawer
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        onSubmit={onCreate}
        alignment={alignment}
      />
    </>
  );
}
