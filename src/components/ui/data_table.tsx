import { Flex, Table, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { keyboardSelectProps } from "@/app/utils/keyboard_select";

export default function DataTable<T extends object>(props: {
  records: T[];
  style?: React.CSSProperties;
  onRowSelect?: (record: T) => void;
  idKey?: keyof T;
  selectedRecordId?: string;
  // Show a column's cells as something other than text, i.e. { status: (value) => <StatusLight ... /> }.
  cellRenderers?: { [K in keyof T]?: (value: T[K], record: T) => ReactNode };
}) {
  const {
    records,
    style,
    onRowSelect,
    idKey,
    selectedRecordId,
    cellRenderers,
  } = props;

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
            {...(onRowSelect
              ? keyboardSelectProps(() => onRowSelect(record))
              : {})}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: "blue.500",
              outlineOffset: "-2px",
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
            {(Object.keys(record) as (keyof T)[]).map((column, cellIndex) => {
              const data = record[column];
              const renderCell = cellRenderers?.[column];
              return (
                <Table.Cell
                  key={`data-row-${index}-cell-${cellIndex}`}
                  justifyItems="center"
                >
                  {renderCell ? (
                    <Flex justifyContent="center">
                      {renderCell(data, record)}
                    </Flex>
                  ) : (
                    <Text maxWidth={300} truncate>
                      {data !== null && data !== undefined
                        ? data.toString()
                        : ""}
                    </Text>
                  )}
                </Table.Cell>
              );
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ) : null;
}
