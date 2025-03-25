"use server";

import CaloriesPageContent from "@/components/calories/calories_page_content";
import CheckPermissionsForContent from "../utils/check_permissions_for_content";

export default async function CaloriesPage() {
  return (
    <CheckPermissionsForContent
      requiredPermissions={["logged-in"]}
      redirect="/"
    >
      <CaloriesPageContent />
    </CheckPermissionsForContent>
  );
}
