import { toaster } from "@/components/ui/toaster";

export async function fetchWithToast<T extends object>(
  title: string,
  fetchCallback: () => Promise<T | null>,
): Promise<T | null> {
  const toastId = toaster.create({
    title,
    description: "...",
    type: "loading",
    meta: {
      closable: true,
    },
  });

  const response = await fetchCallback();
  if (!response) {
    toaster.update(toastId, {
      title,
      description: "Failed",
      type: "error",
      meta: {
        closable: true,
      },
    });
    return null;
  }

  toaster.update(toastId, {
    title,
    description: "Finished",
    type: "success",
    meta: {
      closable: true,
    },
  });

  return response;
}
