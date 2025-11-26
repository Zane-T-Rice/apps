import { Button } from "../recipes/button";
import { Stack, StackProps, Text } from "@chakra-ui/react";

export function IncrementalNumberEditor(
  props: {
    decreaseCallback: () => void;
    increaseCallback: () => void;
    text: string;
  } & StackProps,
) {
  const { decreaseCallback, increaseCallback, text, ...stackProps } = props;
  const buttonHeight = 8;
  return (
    <Stack direction="row" alignItems="center" flex="auto" {...stackProps}>
      <Button
        variant={"safe"}
        onClick={() => {
          decreaseCallback();
        }}
        height={buttonHeight}
      >
        -
      </Button>
      <Text marginLeft="auto" marginRight="auto">
        {text}
      </Text>
      <Button
        variant={"safe"}
        onClick={() => {
          increaseCallback();
        }}
        height={buttonHeight}
      >
        +
      </Button>
    </Stack>
  );
}
