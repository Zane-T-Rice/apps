"use server";

import ServersPageContent from "@/components/servers/servers_page_content";
import CheckPermissionsForContent from "../utils/check_permissions_for_content";

export default async function ServersPage() {
  return (
    <CheckPermissionsForContent
      requiredPermissions={["logged-in", "server-manager-service"]}
      redirect="/"
    >
      <ServersPageContent />
    </CheckPermissionsForContent>
  );
}
