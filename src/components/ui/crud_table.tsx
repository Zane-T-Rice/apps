import { Box, Stack, Text } from "@chakra-ui/react";
import { Button } from "../recipes/button";
import DataTable from "./data_table";
import { AutoFormDrawer } from "./auto_form_drawer";
import { useState } from "react";
import { AlertDialog } from "./alert_dialog";
import { AutoDataList } from "./auto_data_list";

export default function CRUDTable<T extends object>(props: {
  records: T[];
  idKey: keyof T;
  selectedRecordId?: string; // Should this just be selectedRecord: T (and update DataTable also)
  onRowSelect: (record: T) => void;
  onCreate: (record: T) => Promise<boolean>;
  onCreateErrors: { [Property in keyof T]?: string };
  creationRecord: T;
  onEdit: (record: T) => Promise<boolean>;
  onEditErrors: { [Property in keyof T]?: string };
  onDelete: (record: T) => Promise<boolean>;
  style: React.CSSProperties;
}) {
  const {
    records,
    style,
    onRowSelect,
    idKey,
    selectedRecordId,
    onCreate,
    creationRecord,
    onEdit,
    onCreateErrors,
    onEditErrors,
    onDelete,
  } = props;

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const selectedRecord = selectedRecordId
    ? records.find((record) => record[idKey] === selectedRecordId) ?? null
    : null;
  const [createOmit] = useState<string[]>([idKey.toString()]);

  const onCreateButton = () => {
    setIsCreateOpen(true);
    setIsEditOpen(false);
  };

  const onEditButton = () => {
    setIsCreateOpen(false);
    setIsEditOpen(true);
  };

  const onDeleteConfirm = () => {
    if (selectedRecord) onDelete(selectedRecord);
  };

  return (
    <>
      <Stack direction="column">
        <Stack direction="row" gap={1} marginLeft={2} marginRight={4}>
          <Button variant="safe" width="1/3" onClick={() => onCreateButton()}>
            Create
          </Button>
          <Button
            variant="safe"
            disabled={!selectedRecord}
            width="1/3"
            onClick={() => onEditButton()}
          >
            Edit
          </Button>
          <AlertDialog
            trigger={
              <Button variant="unsafe" disabled={!selectedRecord} width="1/3">
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
        </Stack>
        <Box width="100%" overflowX="scroll">
          <DataTable
            records={records}
            style={style}
            onRowSelect={onRowSelect}
            idKey={idKey}
            selectedRecordId={selectedRecordId}
          />
        </Box>
      </Stack>
      <AutoFormDrawer<T>
        record={creationRecord}
        title={"Create"}
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        onSubmit={onCreate}
        errors={onCreateErrors}
        omit={createOmit}
      />
      <AutoFormDrawer<T>
        record={selectedRecord}
        title={"Edit"}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        onSubmit={onEdit}
        errors={onEditErrors}
      />
    </>
  );
}
