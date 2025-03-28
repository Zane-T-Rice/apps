import { fetchWithToast } from "./fetch_with_toast";
import { validateWithErrors } from "./validate_with_errors";

export async function fetchWithValidateAndToast<
  V extends object,
  F extends object
>(params: {
  validateCallback: () => V;
  setErrors: (value: {
    [Property in keyof F]?: string;
  }) => void;
  title: string;
  fetchCallback: (validate: V) => Promise<F | null>;
}): Promise<F | null> {
  const { validateCallback, setErrors, title, fetchCallback } = params;

  const validate = validateWithErrors(validateCallback, setErrors);
  if (!validate) return null;

  const response = await fetchWithToast(
    title,
    async () => await fetchCallback(validate)
  );
  if (!response) return null;

  return response;
}
