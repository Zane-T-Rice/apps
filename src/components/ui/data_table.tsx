import { Table, Text } from "@chakra-ui/react";

export default function DataTable<T extends object>(props: {
  records: T[];
  style: React.CSSProperties;
  onRowSelect?: (record: T) => void;
  idKey?: keyof T;
  selectedRecordId?: string;
}) {
  const { records, style, onRowSelect, idKey, selectedRecordId } = props;

  return records.length > 0 ? (
    <Table.Root variant="outline" style={style}>
      <Table.Header>
        <Table.Row key="column-row">
          {Object.keys(records[0]).map((columnName, index) => (
            <Table.ColumnHeader key={`column-${index}`} justifyItems="center">
              <Text>{columnName}</Text>
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {records.map((record, index) => (
          <Table.Row
            key={`data-row-${index}`}
            onClick={() => {
              onRowSelect?.(record);
            }}
            bg={
              onRowSelect &&
              selectedRecordId &&
              idKey &&
              selectedRecordId === record[idKey]
                ? "blue.500"
                : "none"
            }
            _hover={{
              bg:
                (onRowSelect && !selectedRecordId) ||
                (onRowSelect &&
                  selectedRecordId &&
                  idKey &&
                  selectedRecordId !== record[idKey])
                  ? "blackAlpha.500"
                  : undefined,
            }}
          >
            {Object.values(record).map((data, cellIndex) => (
              <Table.Cell
                key={`data-row-${index}-cell-${cellIndex}`}
                justifyItems="center"
              >
                <Text maxWidth={300} truncate>
                  {data.toString()}
                </Text>
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ) : null;
}
