import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export const useQueryString = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return useMemo(() => {
    const setQueryString = (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      window.history.replaceState(
        {},
        "",
        "/apps" + pathname + "?" + params.toString(),
      );
    };

    const removeQueryString = (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      window.history.replaceState(
        {},
        "",
        "/apps" + pathname + "?" + params.toString(),
      );
    };

    const clearQueryString = () => {
      window.history.replaceState({}, "", "/apps" + pathname);
    };

    const replaceQueryString = (params: URLSearchParams) => {
      window.history.replaceState(
        {},
        "",
        "/apps" + pathname + "?" + params.toString(),
      );
    };

    const getQueryString = () => {
      return new URLSearchParams(searchParams.toString());
    };

    return {
      getQueryString,
      setQueryString,
      removeQueryString,
      clearQueryString,
      replaceQueryString,
    };
  }, [searchParams, pathname]);
};
