"use client";

import { chakra, RecipeVariantProps } from "@chakra-ui/react";
import { buttonRecipe } from "./button.recipe";

type ButtonVariantProps = RecipeVariantProps<typeof buttonRecipe>;

// eslint-disable-next-line
export interface ButtonProps
  extends React.PropsWithChildren<ButtonVariantProps> {}

export const Button = chakra("button", buttonRecipe);
