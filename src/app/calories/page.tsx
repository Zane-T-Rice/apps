"use client";

import CaloriesPageContent from "@/components/ui/calories_page_content";
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";

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
      <CaloriesPageContent />
    </ChakraProvider>
  );
}
