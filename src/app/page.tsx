"use server";

import AppsPageContent from "@/components/apps_page_content";
import CheckPermissionsForContent from "./utils/check_permissions_for_content";

export default async function Home() {
  return (
    // Send people who are not logged in to the login page.
    <CheckPermissionsForContent
      requiredPermissions={["logged-in"]}
      redirect="/login"
    >
      <AppsPageContent />
    </CheckPermissionsForContent>
  );
}
