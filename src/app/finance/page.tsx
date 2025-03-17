"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";

const NavigationBar = dynamic(
  () => import("../../components/ui/navigation_bar"),
  {
    ssr: false,
  }
);

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
