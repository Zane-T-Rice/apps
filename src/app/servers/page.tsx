"use client";

import ServersPageContent from "@/components/servers/servers_page_content";
import CheckPermissionsForContent from "../utils/check_permissions_for_content";

export default function ServersPage() {
  return (
    <CheckPermissionsForContent
      requiredPermissions={["server-manager:admin"]}
      requiresOneOfPermissions={[]}
      redirect="/"
    >
      <ServersPageContent />
    </CheckPermissionsForContent>
  );
}
