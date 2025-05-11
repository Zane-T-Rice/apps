import { ValidationError } from "yup";
import { yupErrorsToMap } from "../yup_errors_to_map";

export function validateWithErrors<T extends object, V extends object>(
  validateCallback: () => V,
  setErrors?: (value: {
    [Property in keyof T]?: string;
  }) => void
): V | null {
  let validate: V | null = null;

  try {
    validate = validateCallback();
    setErrors?.({});
  } catch (err) {
    setErrors?.(yupErrorsToMap(err as ValidationError));
  }

  return validate;
}
