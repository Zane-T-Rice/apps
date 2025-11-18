import { Box, Grid, GridItem, Stack, Text } from "@chakra-ui/react";
import { AlertDialog } from "./alert_dialog";
import { AutoDataList } from "./auto_data_list";
import { useEffect, useState } from "react";
import { usePermissions } from "@/app/utils/use_permissions";
import { AutoFormDrawer } from "./auto_form_drawer";
import { Button } from "../recipes/button";
import { Schema } from "yup";

export default function CRUDButtons<
  T extends object,
  C extends Schema | undefined,
  E extends Schema | undefined,
>(props: {
  omitKeys?: (keyof T)[];
  selectedRecord?: T;
  createPermission?: string;
  creationRecord?: T;
  onCreate?: (record: T) => Promise<boolean>;
  createResourceSchema?: C;
  editPermission?: string;
  onEdit?: (record: T) => Promise<boolean>;
  editResourceSchema?: E;
  deletePermission?: string;
  onDelete?: (record: T) => Promise<boolean>;
  desiredFieldOrder?: { [Property in keyof T]?: number };
}) {
  const {
    omitKeys,
    selectedRecord,
    createPermission,
    creationRecord,
    onCreate,
    createResourceSchema,
    editPermission,
    onEdit,
    editResourceSchema,
    deletePermission,
    onDelete,
    desiredFieldOrder,
  } = props;

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const { hasPermissions } = usePermissions();
  const [hasCreatePermission, setHasCreatePermission] = useState<
    boolean | null
  >(false);
  const [hasEditPermission, setHasEditPermission] = useState<boolean | null>(
    false,
  );
  const [hasDeletePermission, setHasDeletePermission] = useState<
    boolean | null
  >(false);

  useEffect(() => {
    const getPermissions = async () => {
      if (createPermission)
        setHasCreatePermission(await hasPermissions([createPermission]));
      if (editPermission)
        setHasEditPermission(await hasPermissions([editPermission]));
      if (deletePermission)
        setHasDeletePermission(await hasPermissions([deletePermission]));
    };
    getPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreateButton = () => {
    setIsCreateOpen(true);
    setIsEditOpen(false);
  };

  const onEditButton = () => {
    setIsCreateOpen(false);
    setIsEditOpen(true);
  };

  const onDeleteConfirm = () => {
    if (selectedRecord && onDelete) onDelete(selectedRecord);
  };

  const numberOfButtons = [
    createPermission,
    editPermission,
    deletePermission,
  ].filter((e) => !!e).length;
  const createEditDeleteWidth =
    numberOfButtons === 3 ? 2 : numberOfButtons === 2 ? 3 : 6;

  return (
    <>
      <Grid
        templateColumns={{
          base: "repeat(6, 1fr)",
        }}
        gap="3"
        marginLeft={3}
        marginRight={3}
      >
        {createPermission !== undefined ? (
          <GridItem colSpan={createEditDeleteWidth}>
            <Button
              variant="safe"
              width="100%"
              onClick={() => onCreateButton()}
              disabled={!hasCreatePermission}
            >
              Create
            </Button>
          </GridItem>
        ) : null}
        {editPermission !== undefined ? (
          <GridItem colSpan={createEditDeleteWidth}>
            <Button
              variant="safe"
              disabled={!selectedRecord || !hasEditPermission}
              width="100%"
              onClick={() => onEditButton()}
            >
              Edit
            </Button>
          </GridItem>
        ) : null}
        {deletePermission ? (
          <GridItem colSpan={createEditDeleteWidth}>
            <Box width="100%">
              <AlertDialog
                trigger={
                  <Button
                    variant="unsafe"
                    disabled={!selectedRecord || !hasDeletePermission}
                    width="100%"
                  >
                    Delete
                  </Button>
                }
                body={
                  selectedRecord ? (
                    <Stack direction="column">
                      <Text>Are you sure that you want to delete:</Text>
                      <AutoDataList record={selectedRecord} />
                    </Stack>
                  ) : null
                }
                onConfirm={onDeleteConfirm}
                confirmText="Delete"
              />
            </Box>
          </GridItem>
        ) : null}
      </Grid>
      {creationRecord &&
      onCreate &&
      createResourceSchema &&
      createPermission !== undefined ? (
        <AutoFormDrawer<T, typeof createResourceSchema>
          record={creationRecord}
          title={"Create"}
          isOpen={isCreateOpen}
          setIsOpen={setIsCreateOpen}
          onSubmit={onCreate}
          resourceSchema={createResourceSchema}
          omitFields={omitKeys}
          desiredFieldOrder={desiredFieldOrder}
        />
      ) : null}
      {onEdit && editResourceSchema && editPermission !== undefined ? (
        <AutoFormDrawer<T, typeof editResourceSchema>
          record={selectedRecord}
          title={"Edit"}
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          onSubmit={onEdit}
          resourceSchema={editResourceSchema}
          omitFields={omitKeys}
          desiredFieldOrder={desiredFieldOrder}
        />
      ) : null}
    </>
  );
}
