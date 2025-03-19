import {
  Button,
  CloseButton,
  Drawer,
  Field,
  HStack,
  Input,
  Portal,
} from "@chakra-ui/react";
import { GrClear } from "react-icons/gr";
import { Item } from "./calories_page_content";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { UseDialogContext } from "@ark-ui/react";

export default function AddItemButtonGroup(props: {
  clearItems: () => void;
  addItem: (item: Item) => void;
  items: Item[];
}) {
  const { clearItems, addItem, items } = props;
  const [name, setName] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [submittedOnce, setSubmittedOnce] = useState<boolean>(false);

  const submit = (store: UseDialogContext) => {
    setSubmittedOnce(true);
    if (name && calories) {
      addItem({ name, amount: parseInt(calories) });
      store.setOpen(false);
      setName("");
      setCalories("");
      setSubmittedOnce(false);
    }
  };

  return (
    <HStack>
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <Button variant="solid" colorPalette="green" rounded="xl">
            <FaPlus /> Add Item
          </Button>
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Context>
                {(store) => (
                  <>
                    <Drawer.Header>
                      <Drawer.Title>Add Item</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <Field.Root invalid={!name && submittedOnce} required>
                        <Field.Label>
                          Name <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                          placeholder="Coke"
                          onChange={(event) => setName(event.target.value)}
                          value={name}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              submit(store);
                            }
                          }}
                        />
                        <Field.ErrorText>
                          This field is required
                        </Field.ErrorText>
                      </Field.Root>
                      <br />
                      <Field.Root invalid={!calories && submittedOnce} required>
                        <Field.Label>
                          Calories <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                          placeholder="140"
                          onChange={(event) => {
                            const negative =
                              event.target.value.charAt(0) === "-" ? "-" : "";
                            const newValue = event.target.value.replace(
                              /\D/g,
                              ""
                            );
                            setCalories(negative + newValue);
                          }}
                          value={calories}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              submit(store);
                            }
                          }}
                        />
                        <Field.ErrorText>
                          This field is required
                        </Field.ErrorText>
                      </Field.Root>
                    </Drawer.Body>
                    <Drawer.Footer>
                      <Button
                        variant="outline"
                        onClick={() => {
                          store.setOpen(false);
                          setName("");
                          setCalories("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => submit(store)}
                        disabled={!name || !calories}
                      >
                        Save
                      </Button>
                    </Drawer.Footer>
                  </>
                )}
              </Drawer.Context>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
      {items && items.length > 0 ? (
        <Button
          variant="solid"
          colorPalette="green"
          rounded="xl"
          onClick={() => {
            clearItems();
          }}
        >
          <GrClear /> Clear Items
        </Button>
      ) : null}
    </HStack>
  );
}
