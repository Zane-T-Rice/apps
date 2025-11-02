"use client";

import GloomhavenCompanionPageContent from "@/components/gloomhaven_companion/gloomhaven_companion_page_content";
import CheckPermissionsForContent from "../utils/check_permissions_for_content";

export default function GloomhavenCompanionsPage() {
  return (
    <CheckPermissionsForContent
      requiredPermissions={[]}
      requiresOneOfPermissions={["gloomhaven-companion:admin", "gloomhaven-companion:public"]}
      redirect="/"
    >
      <GloomhavenCompanionPageContent />
    </CheckPermissionsForContent>
  );
}
