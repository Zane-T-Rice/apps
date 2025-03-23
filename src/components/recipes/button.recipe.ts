import { defaultConfig, defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  ...defaultConfig.theme?.recipes?.button,
  variants: {
    ...defaultConfig.theme?.recipes?.button?.variants,
    safe: {
      solid: {
        bg: "green.600",
        color: "white",
      },
    },
    unsafe: {
      solid: {
        bg: "red",
        color: "white",
      },
    },
  },
});
