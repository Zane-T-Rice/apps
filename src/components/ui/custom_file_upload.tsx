import { parse } from "csv-parse/sync";
import { HiUpload } from "react-icons/hi";
import {
  Box,
  Button,
  FileUpload,
  HStack,
  useFileUpload,
} from "@chakra-ui/react";
import { FileAcceptDetails } from "@zag-js/file-upload";
import { RawTransaction } from "@/app/utils/transaction_analysis";
import { GrClear } from "react-icons/gr";

export default function CustomFileUpload(props: {
  clearTransactions: () => void;
  setTransactions: (newTransactions: RawTransaction[]) => void;
}) {
  const { clearTransactions, setTransactions } = props;

  const handleFileUpload = async (details: FileAcceptDetails) => {
    const texts = await Promise.all(
      details.files.map(async (file) => {
        const text = await file.text();
        return text;
      })
    );

    const records: RawTransaction[] = [];
    texts.forEach((text) => {
      records.push(
        ...parse(text, {
          columns: true,
          skip_empty_lines: true,
        })
      );
    });

    setTransactions(records);
  };

  const fileUpload = useFileUpload({
    maxFiles: 100,
    accept: "text/csv",
    onFileAccept: handleFileUpload,
  });

  return (
    <Box>
      <HStack>
        <FileUpload.RootProvider value={fileUpload}>
          <FileUpload.HiddenInput />
          <FileUpload.Trigger asChild>
            <Button variant="solid" colorPalette="green" rounded="xl">
              <HiUpload /> Import Transactions
            </Button>
          </FileUpload.Trigger>
          {/* <FileUpload.List showSize clearable /> */}
        </FileUpload.RootProvider>
        {fileUpload.acceptedFiles && fileUpload.acceptedFiles.length > 0 ? (
          <Button
            variant="solid"
            colorPalette="green"
            rounded="xl"
            onClick={() => {
              clearTransactions();
              fileUpload.clearFiles();
            }}
          >
            <GrClear /> Clear Transactions
          </Button>
        ) : null}
      </HStack>
    </Box>
  );
}
