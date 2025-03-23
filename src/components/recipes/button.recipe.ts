import { defaultConfig, defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  ...defaultConfig.theme?.recipes?.button,
  variants: {
    ...defaultConfig.theme?.recipes?.button?.variants,
    variant: {
      outline: {
        ...defaultConfig.theme?.recipes?.button?.variants?.variant?.outline,
      },
      safe: {
        ...defaultConfig.theme?.recipes?.button?.variants?.variant?.solid,
        colorPalette: "green",
      },
      unsafe: {
        ...defaultConfig.theme?.recipes?.button?.variants?.variant?.solid,
        colorPalette: "red",
      },
    },
  },
});
