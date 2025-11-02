import { Box, Stack, StackProps, Text } from "@chakra-ui/react";
import { AlertDialog } from "./alert_dialog";
import { AutoDataList } from "./auto_data_list";
import { useEffect, useState } from "react";
import { usePermissions } from "@/app/utils/use_permissions";
import { AutoFormDrawer } from "./auto_form_drawer";
import { Button } from "../recipes/button";

export default function CRUDButtons<T extends object>(props: {
    omitKeys?: (keyof T)[];
    selectedRecord?: T;
    onCreate?: (record: T) => Promise<boolean>;
    onCreateErrors?: { [Property in keyof T]?: string };
    createPermission?: string;
    creationRecord?: T;
    onEdit?: (record: T) => Promise<boolean>;
    onEditErrors?: { [Property in keyof T]?: string };
    editPermission?: string;
    onDelete?: (record: T) => Promise<boolean>;
    deletePermission?: string;
} & StackProps) {
    const {
        omitKeys,
        selectedRecord,
        onCreate,
        creationRecord,
        onEdit,
        onCreateErrors,
        onEditErrors,
        onDelete,
        createPermission,
        editPermission,
        deletePermission,
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
            onCreateErrors &&
            createPermission !== undefined ? (
            <AutoFormDrawer<T>
                record={creationRecord}
                title={"Create"}
                isOpen={isCreateOpen}
                setIsOpen={setIsCreateOpen}
                onSubmit={onCreate}
                errors={onCreateErrors}
                omitFields={omitKeys}
            />
        ) : null}
        {onEdit && onEditErrors && editPermission !== undefined ? (
            <AutoFormDrawer<T>
                record={selectedRecord}
                title={"Edit"}
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                onSubmit={onEdit}
                errors={onEditErrors}
                omitFields={omitKeys}
            />
        ) : null}
    </>
}