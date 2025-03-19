import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useLocalStorage<T>(
  storageKey: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);

  // The empty dependency array will only call this
  // once, when the component is rendered. This sets
  // the initial value from local storage.
  useEffect(() => {
    const storedValue = localStorage.getItem(storageKey);
    setValue(storedValue !== null ? JSON.parse(storedValue) : defaultValue);
  }, []);

  // This useEffect updates the value in storage as the user makes changes.
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue];
}
