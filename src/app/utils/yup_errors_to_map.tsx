import { ValidationError } from "yup";

export const yupErrorsToMap = (errors: ValidationError) => {
  if (errors.inner.length > 0) {
    return errors.inner.reduce((a, b) => {
      if (b.path) return { ...a, [b.path]: b.errors[0] };
      else return a;
    }, {});
  } else if (errors.path) {
    return { [errors.path]: errors.message };
  }
  return {};
};
