"use client";

import CaloriesPageContent from "@/components/calories/calories_page_content";
import CheckPermissionsForContent from "../utils/check_permissions_for_content";

export default function CaloriesPage() {
  return (
    <CheckPermissionsForContent
      requiredPermissions={["admin:servers"]}
      redirect="/"
    >
      <CaloriesPageContent />
    </CheckPermissionsForContent>
  );
}
