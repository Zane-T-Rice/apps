import { Box, Stack, StackProps } from "@chakra-ui/react";
import DataTable from "./data_table";
import CRUDButtons from "./crud_buttons";
import { Schema } from "yup";

export default function CRUDTable<
  T extends object,
  C extends Schema | undefined,
  E extends Schema | undefined,
>(
  props: {
    records: T[];
    idKey: keyof T;
    selectedRecordId?: string; // Should this just be selectedRecord: T (and update DataTable also)
    onRowSelect: (record: T) => void;
    createPermission?: string;
    creationRecord?: T;
    onCreate?: (record: T) => Promise<boolean>;
    createResourceSchema?: C;
    editPermission?: string;
    onEdit?: (record: T) => Promise<boolean>;
    editResourceSchema?: E;
    deletePermission?: string;
    onDelete?: (record: T) => Promise<boolean>;
  } & StackProps,
) {
  const {
    records,
    idKey,
    selectedRecordId,
    onRowSelect,
    createPermission,
    creationRecord,
    onCreate,
    createResourceSchema,
    editPermission,
    onEdit,
    editResourceSchema,
    deletePermission,
    onDelete,
    ...stackProps
  } = props;

  const selectedRecord = selectedRecordId
    ? (records.find((record) => record[idKey] === selectedRecordId) ??
      undefined)
    : undefined;

  return (
    <>
      <Stack direction="column" {...stackProps}>
        <CRUDButtons
          omitKeys={[idKey]}
          selectedRecord={selectedRecord}
          createPermission={createPermission}
          creationRecord={creationRecord}
          onCreate={onCreate}
          createResourceSchema={createResourceSchema}
          editPermission={editPermission}
          onEdit={onEdit}
          editResourceSchema={editResourceSchema}
          deletePermission={deletePermission}
          onDelete={onDelete}
          confirmDelete
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
