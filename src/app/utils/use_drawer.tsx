import { useEffect, useState } from "react";
import { usePermissions } from "./use_permissions";

export function useDrawer() {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const { hasPermissions } = usePermissions();
  const [hasCreatePermission, setHasCreatePermission] = useState<
    boolean | null
  >(false);

  useEffect(() => {
    const getPermissions = async () => {
      setHasCreatePermission(
        await hasPermissions(["gloomhaven-companion:public"]),
      );
    };
    getPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreateButton = () => {
    setIsCreateOpen(true);
  };

  return {
    isCreateOpen,
    setIsCreateOpen,
    onCreateButton,
    hasCreatePermission,
  };
}
