"use client";

import CheckPermissionsForContent from "../utils/check_permissions_for_content";
import MyServersPageContent from "@/components/servers/my_servers_page_content";

export default function ServersPage() {
  return (
    <CheckPermissionsForContent
      requiredPermissions={[]}
      requiresOneOfPermissions={["server-manager:admin", "server-manager:public"]}
      redirect="/"
    >
      <MyServersPageContent />
    </CheckPermissionsForContent>
  );
}
