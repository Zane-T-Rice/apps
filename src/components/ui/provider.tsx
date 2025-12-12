"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ThemeProvider, ThemeProviderProps } from "next-themes";
import { ColorModeProvider } from "./color-mode";

const customConfig = defineConfig({
  theme: {
    breakpoints: {
      md: "56em",
      lg: "82em",
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);

export function Provider(props: ThemeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
      </ColorModeProvider>
    </ChakraProvider>
  );
}
