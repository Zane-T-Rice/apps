"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ThemeProvider, ThemeProviderProps } from "next-themes";
import { ColorModeProvider } from "./color-mode";
import { useEffect } from "react";
import { keepFocusUsable } from "@/app/utils/keyboard_select";

const customConfig = defineConfig({
  theme: {
    breakpoints: {
      md: "56em",
      lg: "82em",
      xl: "96em",
      "2xl": "120em",
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);

export function Provider(props: ThemeProviderProps) {
  useEffect(() => keepFocusUsable(), []);

  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
      </ColorModeProvider>
    </ChakraProvider>
  );
}
