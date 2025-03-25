"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ThemeProvider, ThemeProviderProps } from "next-themes";

const customConfig = defineConfig({});

export const system = createSystem(defaultConfig, customConfig);

export function Provider(props: ThemeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
    </ChakraProvider>
  );
}
