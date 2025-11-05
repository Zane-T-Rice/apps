import { Box, Stack, StackProps, Text } from "@chakra-ui/react";
import { AlertDialog } from "./alert_dialog";
import { AutoDataList } from "./auto_data_list";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { usePermissions } from "@/app/utils/use_permissions";
import { AutoFormDrawer } from "./auto_form_drawer";
import { Button } from "../recipes/button";
import { Schema } from "yup";

export default function CRUDButtons<T extends object, C extends Schema | undefined, E extends Schema | undefined>(props: {
    omitKeys?: (keyof T)[];
    selectedRecord?: T;
    createPermission?: string;
    creationRecord?: T;
    onCreate?: (record: T) => Promise<boolean>;
    createErrors?: { [Property in keyof T]?: string };
    setCreateErrors?: Dispatch<SetStateAction<{ [Property in keyof T]?: string }>>;
    createResourceSchema?: C;
    editPermission?: string;
    onEdit?: (record: T) => Promise<boolean>;
    editErrors?: { [Property in keyof T]?: string };
    setEditErrors?: Dispatch<SetStateAction<{ [Property in keyof T]?: string }>>;
    editResourceSchema?: E;
    deletePermission?: string;
    onDelete?: (record: T) => Promise<boolean>;
} & StackProps) {
    const {
        omitKeys,
        selectedRecord,
        createPermission,
        creationRecord,
        onCreate,
        createErrors,
        setCreateErrors,
        createResourceSchema,
        editPermission,
        onEdit,
        editErrors,
        setEditErrors,
        editResourceSchema,
        deletePermission,
        onDelete,
        ...stackProps
    } = props;

    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

    const { hasPermissions } = usePermissions();
    const [hasCreatePermission, setHasCreatePermission] = useState<
        boolean | null
    >(false);
    const [hasEditPermission, setHasEditPermission] = useState<boolean | null>(
        false
    );
    const [hasDeletePermission, setHasDeletePermission] = useState<
        boolean | null
    >(false);

    useEffect(() => {
        const getPermissions = async () => {
            if (createPermission)
                setHasCreatePermission(await hasPermissions([createPermission]));
            if (editPermission)
                setHasEditPermission(await hasPermissions([editPermission]));
            if (deletePermission)
                setHasDeletePermission(await hasPermissions([deletePermission]));
        };
        getPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onCreateButton = () => {
        setIsCreateOpen(true);
        setIsEditOpen(false);
    };

    const onEditButton = () => {
        setIsCreateOpen(false);
        setIsEditOpen(true);
    };

    const onDeleteConfirm = () => {
        if (selectedRecord && onDelete) onDelete(selectedRecord);
    };

    const createEditDeleteWidth = `1/${[createPermission, editPermission, deletePermission].filter((e) => !!e)
        .length
        }`;

    return <>
        <Stack direction="row" gap={1} {...stackProps}>
            {createPermission !== undefined ? (
                <Button
                    variant="safe"
                    width={createEditDeleteWidth}
                    onClick={() => onCreateButton()}
                    disabled={!hasCreatePermission}
                >
                    Create
                </Button>
            ) : null}
            {editPermission !== undefined ? (
                <Button
                    variant="safe"
                    disabled={!selectedRecord || !hasEditPermission}
                    width={createEditDeleteWidth}
                    onClick={() => onEditButton()}
                >
                    Edit
                </Button>
            ) : null}
            {deletePermission ? (
                <Box width={createEditDeleteWidth}>
                    <AlertDialog
                        trigger={
                            <Button
                                variant="unsafe"
                                disabled={!selectedRecord || !hasDeletePermission}
                                width="100%"
                            >
                                Delete
                            </Button>
                        }
                        body={
                            selectedRecord ? (
                                <Stack direction="column">
                                    <Text>Are you sure that you want to delete:</Text>
                                    <AutoDataList record={selectedRecord} />
                                </Stack>
                            ) : null
                        }
                        onConfirm={onDeleteConfirm}
                        confirmText="Delete"
                    />
                </Box>
            ) : null}
        </Stack>
        {creationRecord &&
            onCreate &&
            createErrors &&
            createResourceSchema &&
            createPermission !== undefined ? (
            <AutoFormDrawer<T, typeof createResourceSchema>
                record={creationRecord}
                title={"Create"}
                isOpen={isCreateOpen}
                setIsOpen={setIsCreateOpen}
                onSubmit={onCreate}
                resourceSchema={createResourceSchema}
                errors={createErrors}
                setErrors={setCreateErrors}
                omitFields={omitKeys}
            />
        ) : null}
        {onEdit && editErrors && editResourceSchema && editPermission !== undefined ? (
            <AutoFormDrawer<T, typeof editResourceSchema>
                record={selectedRecord}
                title={"Edit"}
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                onSubmit={onEdit}
                resourceSchema={editResourceSchema}
                errors={editErrors}
                setErrors={setEditErrors}
                omitFields={omitKeys}
            />
        ) : null}
    </>
}