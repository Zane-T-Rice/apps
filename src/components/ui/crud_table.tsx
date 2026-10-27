import { Box, Stack, StackProps } from "@chakra-ui/react";
import DataTable from "./data_table";
import CRUDButtons from "./crud_buttons";
import { Schema } from "yup";
import { ComponentProps, ReactNode } from "react";

export default function CRUDTable<
  T extends object,
  C extends Schema | undefined,
  E extends Schema | undefined,
>(
  props: {
    records: T[];
    idKey: keyof T;
    // Keys that are shown in the table but are not part of the create and edit forms (idKey is always omitted).
    omitKeys?: (keyof T)[];
    // Show a column's cells as something other than text. See DataTable.
    cellRenderers?: ComponentProps<typeof DataTable<T>>["cellRenderers"];
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
    renderCreateDrawer?: (drawer: {
      isOpen: boolean;
      setIsOpen: (value: boolean) => void;
    }) => ReactNode;
  } & StackProps,
) {
  const {
    records,
    idKey,
    omitKeys = [],
    cellRenderers,
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
    renderCreateDrawer,
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
          omitKeys={[idKey, ...omitKeys]}
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
          renderCreateDrawer={renderCreateDrawer}
        />
        <Box overflowX="auto" overflowY="auto" maxHeight="32rem" tabIndex={-1}>
          <DataTable
            records={records}
            style={{}}
            onRowSelect={onRowSelect}
            idKey={idKey}
            selectedRecordId={selectedRecordId}
            cellRenderers={cellRenderers}
          />
        </Box>
      </Stack>
    </>
  );
}
