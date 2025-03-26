import { Box, Stack } from "@chakra-ui/react";
import { Button } from "../recipes/button";
import DataTable from "./data_table";

export default function CRUDTable<T extends object>(props: {
  records: T[];
  style: React.CSSProperties;
  onRowSelect?: (record: T) => void;
  idKey?: keyof T;
  selectedRecordId?: string;
  onCreate?: () => void;
  onEdit?: () => void;
}) {
  const {
    records,
    style,
    onRowSelect,
    idKey,
    selectedRecordId,
    onCreate,
    onEdit,
  } = props;
  return (
    <>
      <Stack direction="column">
        <Stack direction="row" gap={1} marginLeft={2} marginRight={4}>
          <Button variant="safe" width="1/3" onClick={() => onCreate?.()}>
            Create
          </Button>
          <Button
            variant="safe"
            disabled={!selectedRecordId}
            width="1/3"
            onClick={() => onEdit?.()}
          >
            Edit
          </Button>
          <Button variant="unsafe" disabled={!selectedRecordId} width="1/3">
            Delete
          </Button>
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
    </>
  );
}
