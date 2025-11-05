import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useLocalStorage<T>(
  storageKey: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const storedValue = localStorage.getItem(storageKey);
  const newValue = storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  const [value, setValue] = useState<T>(newValue);

  // This useEffect updates the value in storage as the user makes changes.
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue];
}
