import { Link as ChakraLink } from "@chakra-ui/react";
import NextLink, { LinkProps } from "next/link";
import { ReactNode } from "react";
import { Button } from "../recipes/button";

export function Link(
  props: LinkProps & { children: ReactNode } & { variant: "button" | "text" }
) {
  const { href, children, variant } = props;
  const link = (
    <ChakraLink asChild>
      <NextLink href={href}>{children}</NextLink>
    </ChakraLink>
  );

  return (
    <>
      {variant === "button" ? (
        <Button asChild variant="safe">
          <ChakraLink asChild>
            <NextLink href={href}>{children}</NextLink>
          </ChakraLink>
        </Button>
      ) : null}
      {variant === "text" ? link : null}
    </>
  );
}
