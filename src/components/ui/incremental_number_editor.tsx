import { Button } from "../recipes/button";
import { Stack, Text } from "@chakra-ui/react";

export function IncrementalNumberEditor(props: {
  decreaseCallback: () => void;
  increaseCallback: () => void;
  text: string;
}) {
  const { decreaseCallback, increaseCallback, text } = props;
  const buttonHeight = 8;
  return (
    <Stack direction="row" alignItems="center" flex="auto">
      <Button
        variant={"safe"}
        onClick={() => {
          decreaseCallback();
        }}
        height={buttonHeight}
      >
        -
      </Button>
      <Text marginRight="auto" marginLeft="auto">
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
