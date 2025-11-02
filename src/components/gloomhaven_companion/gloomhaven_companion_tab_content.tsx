import { Card, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AutoDataList } from "../ui/auto_data_list";
import { Campaign, useCampaigns } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { object, string } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";
import CRUDButtons from "../ui/crud_buttons";
import { hydrateId } from "@/app/utils/gloomhaven_companion_service/hydrate_id";

const createCampaignSchema = object({
  name: string().required(),
  parent: string().required(),
  entity: string().required(),
}).stripUnknown();

const editCampaignSchema = createCampaignSchema
  .concat(
    object({
      id: string().required(),
    })
  )
  .stripUnknown();

const deleteCampaignSchema = object({
  id: string().required(),
}).stripUnknown();

export function GloomhavenCompanionTabContent() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof Campaign]?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    [Property in keyof Campaign]?: string;
  }>({});
  const [createCampaignRecord] = useState<Campaign>({
    id: "",
    name: "",
    parent: "",
    entity: ""
  });

  const {
    getAllREST: getCampaigns,
    createREST: createCampaign,
    editREST: editCampaign,
    deleteREST: deleteCampaign,
  } = useCampaigns();

  useEffect(() => {
    getCampaigns().then((responseCampaigns) => {
      if (responseCampaigns) setCampaigns(responseCampaigns.map(hydrateId));
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const onCampaignCreate = async (newCampaign: Campaign): Promise<boolean> => {
    const title = `Creating campaign ${newCampaign.name}`;
    const campaign = await fetchWithValidateAndToast({
      title,
      setErrors: setCreateErrors,
      validateCallback: () => {
        return createCampaignSchema.validateSync(newCampaign, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await createCampaign(validate),
    });
    if (!campaign) return false;
    hydrateId(campaign)

    // Update campaigns with new record
    setCampaigns((prev) => {
      return [...prev, campaign];
    });

    return true;
  };

  const onCampaignEdit = async (newCampaign: Campaign): Promise<boolean> => {
    const title = `Editing campaign ${newCampaign.name}`;
    const campaign = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return editCampaignSchema.validateSync(newCampaign, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await editCampaign(validate),
    });
    if (!campaign) return false;
    hydrateId(campaign)

    // Update campaigns with edited record if success
    setCampaigns((prev) => {
      return prev.map((currentCampaign) =>
        currentCampaign.id === campaign.id ? campaign : currentCampaign
      );
    });
    setSelectedCampaign(campaign)

    return true;
  };

  const onCampaignDelete = async (campaignToDelete: Campaign): Promise<boolean> => {
    const title = `Deleting campaign ${campaignToDelete.name}`;
    const campaign = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return deleteCampaignSchema.validateSync(campaignToDelete, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await deleteCampaign(validate),
    });
    if (!campaign) return false;
    hydrateId(campaign)

    setCampaigns((prev) => {
      return prev.filter((currentCampaign) => currentCampaign.id !== campaign.id);
    });
    setSelectedCampaign(undefined);

    return true;
  };

  const campaignToCampaignInfo = (campaign: Campaign) => ({
    Name: campaign.name,
  });

  return (
    <>
      {isLoading ? (
        <Stack direction="column" marginLeft={2} marginRight={2}>
          <Skeleton height={50} variant="shine" />
          <Skeleton height={250} variant="shine" />
          <Skeleton height={50} variant="shine" />
        </Stack>
      ) : (
        <Stack>
          <CRUDButtons
            idKey="id"
            selectedRecord={selectedCampaign}
            onCreate={onCampaignCreate}
            creationRecord={createCampaignRecord}
            onEdit={onCampaignEdit}
            onCreateErrors={createErrors}
            onEditErrors={editErrors}
            onDelete={onCampaignDelete}
            createPermission="gloomhaven-companion:public"
            editPermission="gloomhaven-companion:public"
            deletePermission="gloomhaven-companion:public"
            marginLeft={3}
            marginRight={3}
          />
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap="0"
          >
            {campaigns.map((campaign, index) => {
              return (
                <GridItem
                  colSpan={1}
                  key={`navigation-bar-grid-item-${index}`}
                  justifyItems="center"
                  onClick={() => onCampaignSelect(campaign)}
                >
                  <Card.Root
                    variant="elevated"
                    width="95%"
                    height="95%"
                    key={`navigation-bar-${index}`}
                  >
                    <Card.Body>
                      <Stack gap={6}>
                        <Card.Title>{`${campaign.name}`}</Card.Title>
                        <AutoDataList record={campaignToCampaignInfo(campaign)} />
                      </Stack>
                    </Card.Body>
                  </Card.Root>
                </GridItem>
              );
            })}
          </Grid>
        </Stack>
      )}
    </>
  )
}
