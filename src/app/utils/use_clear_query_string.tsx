import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useQueryString = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const setQueryString = (campaignId?: string, scenarioId?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (campaignId) params.set("campaignId", campaignId);
    else params.delete("campaignId");
    if (scenarioId) params.set("scenarioId", scenarioId);
    else params.delete("scenarioId");
    router.replace(pathname + "?" + params.toString());
  };
  return {
    setQueryString,
  };
};
