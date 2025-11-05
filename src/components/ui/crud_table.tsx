import { Box, Stack, StackProps } from "@chakra-ui/react";
import DataTable from "./data_table";
import CRUDButtons from "./crud_buttons";
import { Schema } from "yup";
import { Dispatch, SetStateAction } from "react";

export default function CRUDTable<T extends object, C extends Schema | undefined, E extends Schema | undefined>(
  props: {
    records: T[];
    idKey: keyof T;
    selectedRecordId?: string; // Should this just be selectedRecord: T (and update DataTable also)
    onRowSelect: (record: T) => void;
    createPermission?: string;
    creationRecord?: T;
    onCreate?: (record: T) => Promise<boolean>;
    onCreateErrors?: { [Property in keyof T]?: string };
    setCreateErrors?: Dispatch<SetStateAction<{ [Property in keyof T]?: string }>>;
    createResourceSchema?: C;
    editPermission?: string;
    onEdit?: (record: T) => Promise<boolean>;
    onEditErrors?: { [Property in keyof T]?: string };
    setEditErrors?: Dispatch<SetStateAction<{ [Property in keyof T]?: string }>>;
    editResourceSchema?: E;
    deletePermission?: string;
    onDelete?: (record: T) => Promise<boolean>;
  } & StackProps
) {
  const {
    records,
    onRowSelect,
    idKey,
    selectedRecordId,
    createPermission,
    onCreate,
    creationRecord,
    onCreateErrors,
    setCreateErrors,
    createResourceSchema,
    editPermission,
    onEdit,
    onEditErrors,
    setEditErrors,
    editResourceSchema,
    deletePermission,
    onDelete,
    ...stackProps
  } = props;

  const selectedRecord = selectedRecordId
    ? records.find((record) => record[idKey] === selectedRecordId) ?? undefined
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
          createErrors={onCreateErrors}
          setCreateErrors={setCreateErrors}
          createResourceSchema={createResourceSchema}
          editPermission={editPermission}
          onEdit={onEdit}
          editErrors={onEditErrors}
          setEditErrors={setEditErrors}
          editResourceSchema={editResourceSchema}
          deletePermission={deletePermission}
          onDelete={onDelete}
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
