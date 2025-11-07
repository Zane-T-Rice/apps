import { Button } from "../recipes/button";
import { Stack, Text } from "@chakra-ui/react";

export function IncrementalNumberEditor(props: {
  decreaseCallback: () => void;
  increaseCallback: () => void;
  text: string;
}) {
  const { decreaseCallback, increaseCallback, text } = props;
  return (
    <Stack direction="row" alignItems="center" flex="auto">
      <Button
        height="75%"
        variant={"safe"}
        onClick={() => {
          decreaseCallback();
        }}
      >
        -
      </Button>
      <Text marginRight="auto" marginLeft="auto">
        {text}
      </Text>
      <Button
        height="75%"
        variant={"safe"}
        onClick={() => {
          increaseCallback();
        }}
      >
        +
      </Button>
    </Stack>
  );
}
