import { ValidationError } from "yup";

export const yupErrorsToMap = (errors: ValidationError) =>
  errors.inner.reduce((a, b) => {
    if (b.path) return { ...a, [b.path]: b.errors[0] };
    else return a;
  }, {});
