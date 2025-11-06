import { Dispatch, SetStateAction } from "react";
import { fetchWithToast } from "./fetch_with_toast";
import { validateWithErrors } from "./validate_with_errors";

export async function fetchWithValidateAndToast<F extends object>(params: {
  validateCallback: () => (keyof F)[];
  setErrors?: Dispatch<
    SetStateAction<{ [Property in keyof F]?: string | undefined }>
  >;
  title: string;
  fetchCallback: () => Promise<F | null>;
  onlyShowErrors?: boolean;
}): Promise<F | null> {
  const { validateCallback, setErrors, title, fetchCallback, onlyShowErrors } =
    params;

  const validate = validateWithErrors(validateCallback, setErrors);
  if (!validate) return null;

  const response = await fetchWithToast(
    title,
    async () => await fetchCallback(),
    onlyShowErrors,
  );
  if (!response) return null;

  return response;
}
