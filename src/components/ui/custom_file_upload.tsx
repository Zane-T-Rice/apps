import { parse } from "csv-parse/sync";
import { HiUpload } from "react-icons/hi";
import { Box, Button, FileUpload } from "@chakra-ui/react";
import { FileAcceptDetails } from "@zag-js/file-upload";

export default function CustomFileUpload(props: {
  setTransactions: (newTransactions: object[]) => void;
}) {
  const { setTransactions } = props;
  const handleFileUpload = async (details: FileAcceptDetails) => {
    const texts = await Promise.all(
      details.files.map(async (file) => {
        const text = await file.text();
        return text;
      })
    );

    const records: object[] = [];
    texts.forEach((text) => {
      records.push(
        ...parse(text, {
          columns: true,
          skip_empty_lines: true,
        })
      );
    });

    setTransactions(
      records
      // records.filter(
      //   (record) =>
      //     record["Account"] === "LIFEGREEN PREFERRED CHECKING * 4644" &&
      //     // record["Account"] === "CASH REWARDS VISA SIGNATURE * 3004" &&
      //     record["Debit"] >= -10000
      // )
    );
  };

  return (
    <Box>
      <FileUpload.Root
        maxFiles={100}
        accept="text/csv"
        onFileAccept={handleFileUpload}
      >
        <FileUpload.HiddenInput />
        <FileUpload.Trigger asChild>
          <Button variant="solid" colorPalette="green" rounded="xl">
            <HiUpload /> Import Transactions
          </Button>
        </FileUpload.Trigger>
        {/* <FileUpload.List showSize clearable /> */}
      </FileUpload.Root>
    </Box>
  );
}
