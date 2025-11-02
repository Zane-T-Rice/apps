import { Box, Stack, StackProps } from "@chakra-ui/react";
import DataTable from "./data_table";
import CRUDButtons from "./crud_buttons";

export default function CRUDTable<T extends object>(
  props: {
    records: T[];
    idKey: keyof T;
    selectedRecordId?: string; // Should this just be selectedRecord: T (and update DataTable also)
    onRowSelect: (record: T) => void;
    onCreate?: (record: T) => Promise<boolean>;
    onCreateErrors?: { [Property in keyof T]?: string };
    createPermission?: string;
    creationRecord?: T;
    onEdit?: (record: T) => Promise<boolean>;
    onEditErrors?: { [Property in keyof T]?: string };
    editPermission?: string;
    onDelete?: (record: T) => Promise<boolean>;
    deletePermission?: string;
  } & StackProps
) {
  const {
    records,
    onRowSelect,
    idKey,
    selectedRecordId,
    onCreate,
    creationRecord,
    onEdit,
    onCreateErrors,
    onEditErrors,
    onDelete,
    createPermission,
    editPermission,
    deletePermission,
    ...stackProps
  } = props;

  const selectedRecord = selectedRecordId
    ? records.find((record) => record[idKey] === selectedRecordId) ?? undefined
    : undefined;

  return (
    <>
      <Stack direction="column" {...stackProps}>
        <CRUDButtons
          idKey={idKey}
          selectedRecord={selectedRecord}
          onCreate={onCreate}
          creationRecord={creationRecord}
          onEdit={onEdit}
          onCreateErrors={onCreateErrors}
          onEditErrors={onEditErrors}
          onDelete={onDelete}
          createPermission={createPermission}
          editPermission={editPermission}
          deletePermission={deletePermission}
        />
        <Box overflowX="auto" overflowY="auto" maxHeight="32rem">
          <DataTable
            records={records}
            style={{}}
            onRowSelect={onRowSelect}
            idKey={idKey}
            selectedRecordId={selectedRecordId}
          />
        </Box>
      </Stack>
    </>
  );
}
