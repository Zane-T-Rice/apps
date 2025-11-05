import { ValidationError } from "yup";
import { yupErrorsToMap } from "../yup_errors_to_map";
import { Dispatch, SetStateAction } from "react";

export function validateWithErrors<T extends object>(
  validateCallback: () => (keyof T)[],
  setErrors?: Dispatch<SetStateAction<{ [Property in keyof T]?: string | undefined; }>>
): (keyof T)[] | null {
  let validate: (keyof T)[] | null = null;

  try {
    validate = validateCallback();
    setErrors?.((prev) => {
      const errors = { ...prev };
      validate?.forEach((key) => {
        if (errors[key]) delete errors[key]
      })
      return errors;
    });
  } catch (err) {
    setErrors?.((prev) => {
      return {
        ...prev,
        ...yupErrorsToMap(err as ValidationError)
      }
    });
  }

  return validate;
}
