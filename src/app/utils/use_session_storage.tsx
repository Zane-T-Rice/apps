import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useSessionStorage(
  storageKey: string,
  defaultValue = ""
): [string, Dispatch<SetStateAction<string>>] {
  const [value, setValue] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const storedValue = sessionStorage.getItem(storageKey);
      return storedValue !== null ? storedValue : defaultValue;
    } else {
      return defaultValue;
    }
  });

  useEffect(() => {
    sessionStorage.setItem(storageKey, value);
  }, [storageKey, value]);

  return [value, setValue];
}
