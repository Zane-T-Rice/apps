import { Dispatch, SetStateAction } from "react";
import { fetchWithValidateAndToast } from "../fetch/fetch_with_validate_and_toast";
import { Schema } from "yup";

export function useOnCRUD<
    T extends { id: string },
    CreateSchemaType extends Schema | undefined,
    EditSchemaType extends Schema | undefined,
    DeleteSchemaType extends Schema | undefined,
>(props: {
    resourceNameKey: keyof T;
    setCreateErrors?: Dispatch<SetStateAction<{ [Property in keyof T]?: string }>>;
    setEditErrors?: Dispatch<SetStateAction<{ [Property in keyof T]?: string }>>;
    createResourceSchema?: CreateSchemaType;
    editResourceSchema?: EditSchemaType;
    deleteResourceSchema?: DeleteSchemaType;
    createResource?: (resource: T) => Promise<T | null>;
    editResource?: (resource: T) => Promise<T | null>;
    deleteResource?: (resource: T) => Promise<T | null>;
    setResources: Dispatch<SetStateAction<T[]>>;
    setSelectedResource: Dispatch<SetStateAction<T | undefined>>;
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
        setSelectedResource
    } = props;

    const onResourceCreate = async (newResource: T): Promise<boolean> => {
        const title = `Creating resource ${newResource?.[resourceNameKey]}`;
        const resource = await fetchWithValidateAndToast({
            title,
            setErrors: setCreateErrors,
            validateCallback: () => {
                return createResourceSchema?.validateSync(newResource, {
                    abortEarly: false,
                });
            },
            fetchCallback: async (validate) => await createResource?.(validate) || null,
        });
        if (!resource) return false;

        // Update resources with new record
        setResources((prev) => {
            return [...prev, resource];
        });

        return true;
    };

    const onResourceEdit = async (newResource: T): Promise<boolean> => {
        const title = `Editing resource ${newResource?.[resourceNameKey]}`;
        const resource = await fetchWithValidateAndToast({
            title,
            setErrors: setEditErrors,
            validateCallback: () => {
                return editResourceSchema?.validateSync(newResource, {
                    abortEarly: false,
                });
            },
            fetchCallback: async (validate) => await editResource?.(validate) || null,
        });
        if (!resource) return false;

        // Update resources with edited record if success
        setResources((prev) => {
            return prev.map((currentResource) =>
                currentResource.id === resource.id ? resource : currentResource
            );
        });
        setSelectedResource(resource)

        return true;
    };

    const onResourceDelete = async (resourceToDelete: T): Promise<boolean> => {
        const title = `Deleting resource ${resourceToDelete?.[resourceNameKey]}`;
        const resource = await fetchWithValidateAndToast({
            title,
            setErrors: setEditErrors,
            validateCallback: () => {
                return deleteResourceSchema?.validateSync(resourceToDelete, {
                    abortEarly: false,
                });
            },
            fetchCallback: async (validate) => await deleteResource?.(validate) || null,
        });
        if (!resource) return false;

        setResources((prev) => {
            return prev.filter((currentResource) => currentResource.id !== resource.id);
        });
        setSelectedResource(undefined);

        return true;
    };

    return {
        onResourceCreate,
        onResourceDelete,
        onResourceEdit
    }
}