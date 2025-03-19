import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useLocalStorage(
  storageKey: string,
  defaultValue = ""
): [string, Dispatch<SetStateAction<string>>] {
  const [value, setValue] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(storageKey);
      return storedValue !== null ? storedValue : defaultValue;
    } else {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, value);
  }, [storageKey, value]);

  return [value, setValue];
}
