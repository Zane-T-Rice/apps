import { Card, Grid, GridItem, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AutoDataList } from "../ui/auto_data_list";
import {
  Campaign,
  useCampaigns,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { object, string } from "yup";
import CRUDButtons from "../ui/crud_buttons";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";
import { SelectableCardRoot } from "../ui/selectable_card_root";
import { Button } from "../recipes/button";
import {
  JoinCampaign,
  useCreateJoinCampaignCode,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_create_join_campaign_code";
import { fetchWithToast } from "@/app/utils/fetch/fetch_with_toast";
import { AlertDialog } from "../ui/alert_dialog";
import { AutoFormDrawer } from "../ui/auto_form_drawer";
import { useJoinCampaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_join_campaign";
import { useSearchParams } from "next/navigation";

const createCampaignSchema = object({
  name: string().required(),
}).stripUnknown();

const editCampaignSchema = createCampaignSchema
  .concat(
    object({
      id: string().required(),
      updatedAt: string().required(),
    }),
  )
  .stripUnknown();

const deleteCampaignSchema = object({
  id: string().required(),
}).stripUnknown();

const joinCampaignSchema = object({
  code: string().required(),
}).stripUnknown();

export function GloomhavenCompanionCampaignTabContent(props: {
  selectedCampaign?: Campaign;
  setSelectedCampaign: Dispatch<SetStateAction<Campaign | undefined>>;
  onCampaignSelect: (campaign: Campaign) => void;
}) {
  const { selectedCampaign, setSelectedCampaign, onCampaignSelect } = props;
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [createCampaignRecord] = useState<Campaign>({
    id: "",
    name: "",
    parent: "",
    entity: "",
    updatedAt: null,
  });
  const [joinCampaign, setJoinCampaign] = useState<JoinCampaign>();
  const [isJoinCampaignDrawerOpen, setIsJoinCampaignDrawerOpen] =
    useState<boolean>(false);

  const {
    getAllREST: getCampaigns,
    createREST: createCampaign,
    editREST: editCampaign,
    deleteREST: deleteCampaign,
  } = useCampaigns(responseTransformer);

  const { actionREST: actionCreateJoinCampaignCode } =
    useCreateJoinCampaignCode();

  const { customREST: actionJoinCampaign } =
    useJoinCampaign(responseTransformer);

  useEffect(() => {
    getCampaigns().then((responseCampaigns) => {
      if (responseCampaigns) setCampaigns(responseCampaigns);
      if (searchParams.get("campaignId")) {
        const campaign = responseCampaigns?.find(
          (campaign) => campaign.id === searchParams.get("campaignId"),
        );
        if (campaign) {
          setSelectedCampaign(campaign);
        }
      }
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    onResourceCreate: onCampaignCreate,
    onResourceEdit: _onCampaignEdit,
    onResourceDelete: onCampaignDelete,
  } = useOnCRUD<
    Campaign,
    typeof createCampaignSchema,
    typeof editCampaignSchema,
    typeof deleteCampaignSchema
  >({
    resourceNameKey: "name",
    createResourceSchema: createCampaignSchema,
    editResourceSchema: editCampaignSchema,
    deleteResourceSchema: deleteCampaignSchema,
    createResource: createCampaign,
    editResource: editCampaign,
    deleteResource: deleteCampaign,
    setResources: setCampaigns,
    setSelectedResource: setSelectedCampaign,
  });

  const onCampaignEdit = async (
    newResource: Campaign,
    silent?: boolean,
  ): Promise<boolean> => {
    const result = await _onCampaignEdit(newResource, silent);
    // Try to freshen the data. Edit failures are usually from stale data
    // with old updatedAt values.
    if (!result) {
      const responseCampaigns = await getCampaigns();
      if (responseCampaigns) {
        setCampaigns(responseCampaigns);
      }
    }
    return result;
  };

  const campaignToCampaignInfo = (campaign: Campaign) => ({
    Name: campaign.name,
  });

  const generateJoinCode = async (campaign: Campaign) => {
    const response = await fetchWithToast(
      "Generating Invite Code",
      async () => {
        return await actionCreateJoinCampaignCode(campaign, "create-join-code");
      },
    );
    if (response) {
      setJoinCampaign(response);
    }
  };

  const joinCodeBody = () => {
    return <Text>{joinCampaign ? joinCampaign.code : null}</Text>;
  };

  const openJoinCampaignDrawer = () => {
    setIsJoinCampaignDrawerOpen(true);
  };

  const onJoinCampaign = async (joinCampaign: JoinCampaign) => {
    const response = await fetchWithToast("Joining Campaign", async () => {
      return await actionJoinCampaign(joinCampaign, "");
    });
    if (response) {
      setCampaigns((prev) => {
        if (!prev.some((campaign) => campaign.entity === response.entity)) {
          return [...prev, response];
        } else {
          return prev;
        }
      });
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      {isLoading ? (
        <Stack direction="column" marginLeft={2} marginRight={2}>
          <Skeleton height={50} variant="shine" />
          <Skeleton height={250} variant="shine" />
          <Skeleton height={50} variant="shine" />
        </Stack>
      ) : (
        <>
          <Stack gap={3}>
            <CRUDButtons
              omitKeys={["id", "parent", "entity", "updatedAt"]}
              selectedRecord={selectedCampaign}
              createPermission="gloomhaven-companion:public"
              creationRecord={createCampaignRecord}
              onCreate={onCampaignCreate}
              createResourceSchema={createCampaignSchema}
              editPermission="gloomhaven-companion:public"
              onEdit={onCampaignEdit}
              editResourceSchema={editCampaignSchema}
              deletePermission="gloomhaven-companion:public"
              onDelete={onCampaignDelete}
            />
            <Button
              onClick={openJoinCampaignDrawer}
              variant="safe"
              marginLeft={3}
              marginRight={3}
            >
              Use Join Code
            </Button>
            <Grid
              templateColumns={{
                base: "repeat(1, 1fr)",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap="3"
              marginLeft={3}
              marginRight={3}
            >
              {campaigns.map((campaign, index) => {
                return (
                  <GridItem
                    colSpan={1}
                    key={`navigation-bar-grid-item-${index}`}
                    justifyItems="center"
                    onClick={() => onCampaignSelect(campaign)}
                  >
                    <SelectableCardRoot
                      resourceId={campaign.id}
                      selectedResourceId={selectedCampaign?.id}
                    >
                      <Card.Body>
                        <Stack gap={3}>
                          <Card.Title>{`${campaign.name}`}</Card.Title>
                          <AutoDataList
                            record={campaignToCampaignInfo(campaign)}
                          />
                          <AlertDialog
                            trigger={
                              <Button
                                variant="safe"
                                onClick={() => generateJoinCode(campaign)}
                              >
                                Generate Join Code
                              </Button>
                            }
                            onConfirm={() => null}
                            confirmVariant="safe"
                            titleText="This join code is good for 5 minutes."
                            body={joinCodeBody()}
                          />
                        </Stack>
                      </Card.Body>
                    </SelectableCardRoot>
                  </GridItem>
                );
              })}
            </Grid>
          </Stack>
        </>
      )}

      <AutoFormDrawer
        record={{ id: selectedCampaign?.id || "", code: "" }}
        title="Enter the join code."
        isOpen={isJoinCampaignDrawerOpen}
        setIsOpen={setIsJoinCampaignDrawerOpen}
        onSubmit={onJoinCampaign}
        resourceSchema={joinCampaignSchema}
        omitFields={["id"]}
      />
    </>
  );
}
