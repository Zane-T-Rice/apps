"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
  Link,
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
      <Link href="/calories/calories">Calories</Link>
      <Link href="/calories/finance">Finance</Link>
    </ChakraProvider>
  );
}
