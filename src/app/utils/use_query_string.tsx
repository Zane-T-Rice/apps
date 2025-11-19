import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useQueryString = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const setQueryString = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(pathname + "?" + params.toString(), { scroll: false });
  };

  const removeQueryString = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.replace(pathname + "?" + params.toString(), { scroll: false });
  };

  const clearQueryString = () => {
    router.replace(pathname, { scroll: false });
  };

  const replaceQueryString = (params: URLSearchParams) => {
    router.replace(pathname + "?" + params.toString(), { scroll: false });
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
};
