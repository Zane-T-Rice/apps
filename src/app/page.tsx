"use client";

import AppsPageContent from "@/components/apps_page_content";
import CheckPermissionsForContent from "./utils/check_permissions_for_content";

export default function Home() {
  return (
    <CheckPermissionsForContent requiredPermissions={[]}>
      <AppsPageContent />
    </CheckPermissionsForContent>
  );
}
