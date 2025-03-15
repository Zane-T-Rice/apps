"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import NavigationBar from "@/components/ui/navigation_bar";

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
  },
});

const system = createSystem(defaultConfig, customConfig);

export default function Home() {
  return (
    <ChakraProvider value={system}>
      <NavigationBar />
    </ChakraProvider>
  );
}
