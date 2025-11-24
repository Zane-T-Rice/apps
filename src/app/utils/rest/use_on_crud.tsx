import { Dispatch, SetStateAction, useCallback } from "react";
import { fetchWithValidateAndToast } from "../fetch/fetch_with_validate_and_toast";
import { Schema } from "yup";

export function useOnCRUD<
  T extends { id: string },
  CreateSchemaType extends Schema | undefined,
  EditSchemaType extends Schema | undefined,
  DeleteSchemaType extends Schema | undefined,
>(props: {
  resourceNameKey: keyof T;
  setCreateErrors?: Dispatch<
    SetStateAction<{ [Property in keyof T]?: string }>
  >;
  setEditErrors?: Dispatch<SetStateAction<{ [Property in keyof T]?: string }>>;
  createResourceSchema?: CreateSchemaType;
  editResourceSchema?: EditSchemaType;
  deleteResourceSchema?: DeleteSchemaType;
  createResource?: (resource: T) => Promise<T | null>;
  editResource?: (resource: T) => Promise<T | null>;
  deleteResource?: (resource: T) => Promise<T | null>;
  setResources: Dispatch<SetStateAction<T[]>>;
  setSelectedResource: Dispatch<SetStateAction<T | undefined>>;
  sendMessage?: (resource: T, action: string) => void;
}) {
  const {
    resourceNameKey,
    setCreateErrors,
    setEditErrors,
    createResourceSchema,
    editResourceSchema,
    deleteResourceSchema,
    createResource,
    editResource,
    deleteResource,
    setResources,
    setSelectedResource,
    sendMessage,
  } = props;

  const onResourceCreate: (
    newResource: T,
    silent?: boolean,
  ) => Promise<boolean> = useCallback(
    async (newResource: T, silent: boolean = false): Promise<boolean> => {
      const title = `Creating ${newResource?.[resourceNameKey]}`;
      const resource = await fetchWithValidateAndToast({
        title,
        setErrors: setCreateErrors,
        validateCallback: () => {
          createResourceSchema?.validateSync(newResource, {
            abortEarly: false,
          });
          return Object.keys(newResource) as (keyof T)[];
        },
        fetchCallback: async () =>
          (await createResource?.(newResource)) || null,
        silent,
      });
      if (!resource) return false;

      // Update resources with new record
      setResources((prev) => {
        return [...prev, resource];
      });

      sendMessage?.(resource, "POST");

      return true;
    },
    [
      resourceNameKey,
      createResourceSchema,
      createResource,
      sendMessage,
      setCreateErrors,
      setResources,
    ],
  );

  const onResourceEdit: (newResource: T, silent?: boolean) => Promise<boolean> =
    useCallback(
      async (newResource: T, silent: boolean = false): Promise<boolean> => {
        const title = `Editing ${newResource?.[resourceNameKey]}`;
        const resource = await fetchWithValidateAndToast({
          title,
          setErrors: setEditErrors,
          validateCallback: () => {
            editResourceSchema?.validateSync(newResource, {
              abortEarly: false,
            });
            return Object.keys(newResource) as (keyof T)[];
          },
          fetchCallback: async () =>
            (await editResource?.(newResource)) || null,
          silent,
        });
        if (!resource) return false;

        // Update resources with edited record if success
        setResources((prev) => {
          return prev.map((currentResource) =>
            currentResource.id === resource.id ? resource : currentResource,
          );
        });
        setSelectedResource(resource);
        sendMessage?.(resource, "PATCH");

        return true;
      },
      [
        editResource,
        editResourceSchema,
        resourceNameKey,
        sendMessage,
        setEditErrors,
        setResources,
        setSelectedResource,
      ],
    );

  const onResourceDelete: (
    resourceToDelete: T,
    silent?: boolean,
  ) => Promise<boolean> = useCallback(
    async (resourceToDelete: T, silent: boolean = false): Promise<boolean> => {
      const title = `Deleting ${resourceToDelete?.[resourceNameKey]}`;
      const resource = await fetchWithValidateAndToast({
        title,
        setErrors: setEditErrors,
        validateCallback: () => {
          deleteResourceSchema?.validateSync(resourceToDelete, {
            abortEarly: false,
          });
          return Object.keys(resourceToDelete) as (keyof T)[];
        },
        fetchCallback: async () =>
          (await deleteResource?.(resourceToDelete)) || null,
        silent,
      });
      if (!resource) return false;

      setResources((prev) => {
        return prev.filter(
          (currentResource) => currentResource.id !== resourceToDelete.id,
        );
      });
      setSelectedResource((prev) => {
        if (prev?.id === resourceToDelete.id) return undefined;
        return prev;
      });
      sendMessage?.(resourceToDelete, "DELETE");

      return true;
    },
    [
      deleteResource,
      deleteResourceSchema,
      resourceNameKey,
      sendMessage,
      setEditErrors,
      setResources,
      setSelectedResource,
    ],
  );

  return {
    onResourceCreate,
    onResourceDelete,
    onResourceEdit,
  };
}
