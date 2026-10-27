"use client";

import { IconButton } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaCheck, FaRegCopy } from "react-icons/fa";

const COPIED_FOR_MS = 1500;

// An icon that copies an id when clicked. Ids are rarely read, so they are not shown as text.
// The icon turns into a check mark for a moment to show the copy worked.
export function CopyIdButton(props: { id: string }) {
  const { id } = props;
  const [copied, setCopied] = useState<boolean>(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <IconButton
      size="xs"
      variant="ghost"
      aria-label={copied ? "Id copied" : "Copy id"}
      onClick={async (e) => {
        // Do not also select the row the icon is in.
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(id);
        } catch {
          // The browser refused (i.e. the page is not secure), so there is nothing to confirm.
          return;
        }
        setCopied(true);
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setCopied(false), COPIED_FOR_MS);
      }}
    >
      {copied ? <FaCheck /> : <FaRegCopy />}
    </IconButton>
  );
}
