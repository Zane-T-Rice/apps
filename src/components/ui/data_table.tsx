import { Table } from "@chakra-ui/react";

export default function DataTable(props: {
  records: object[];
  style: React.CSSProperties;
}) {
  const { records, style } = props;

  return records.length > 0 ? (
    <Table.Root variant="outline" width="fit-content" style={style}>
      <Table.Header>
        <Table.Row key="column-row">
          {Object.keys(records[0]).map((columnName, index) => (
            <Table.ColumnHeader key={`column-${index}`}>
              {columnName}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {records.map((record, index) => (
          <Table.Row key={`data-row-${index}`}>
            {Object.values(record).map((data, cellIndex) => (
              <Table.Cell
                key={`data-row-${index}-cell-${cellIndex}`}
                textWrap="nowrap"
              >
                {data}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ) : null;
}
