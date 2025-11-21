import { Button } from "../recipes/button";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { useDrawer } from "@/app/utils/use_drawer";
import { AddMonsterDrawer } from "./add_monster_drawer";

export default function AddMonsterButton(props: {
  onCreate: (record: Figure) => Promise<boolean>;
  templates: Template[];
  alignment: string;
}) {
  const { onCreate, templates, alignment } = props;
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
        Add Monster
      </Button>
      <AddMonsterDrawer
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        onSubmit={onCreate}
        templates={templates}
        alignment={alignment}
      />
    </>
  );
}
