import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useLocalStorage<T>(
  storageKey: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // The empty dependency array will only call this
  // once, when the component is rendered. This sets
  // the initial value from local storage.
  useEffect(() => {
    const storedValue = localStorage.getItem(storageKey);
    setValue(storedValue !== null ? JSON.parse(storedValue) : defaultValue);
    setIsLoading(false);
    // eslint-disable-next-line
  }, []);

  // This useEffect updates the value in storage as the user makes changes.
  useEffect(() => {
    if (isLoading) return;

    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [isLoading, storageKey, value]);

  return [value, setValue];
}
