import { Button } from "../recipes/button";
import { Center, Stack } from "@chakra-ui/react";

export function IncrementalNumberEditor(props: {
  decreaseCallback: () => void;
  increaseCallback: () => void;
  text: string;
}) {
  const { decreaseCallback, increaseCallback, text } = props;
  return (
    <Stack direction="row" minWidth="100%">
      <Button
        minWidth="1/12"
        height="1/2"
        variant={"safe"}
        onClick={() => {
          decreaseCallback();
        }}
      >
        -
      </Button>
      <Center minWidth="1/6">{text}</Center>
      <Button
        minWidth="1/12"
        height="1/2"
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
