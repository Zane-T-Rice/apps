import { Card, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
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

const createCampaignSchema = object({
  name: string().required(),
}).stripUnknown();

const editCampaignSchema = createCampaignSchema
  .concat(
    object({
      id: string().required(),
    }),
  )
  .stripUnknown();

const deleteCampaignSchema = object({
  id: string().required(),
}).stripUnknown();

export function GloomhavenCompanionCampaignTabContent(props: {
  selectedCampaign?: Campaign;
  setSelectedCampaign: Dispatch<SetStateAction<Campaign | undefined>>;
  onCampaignSelect: (campaign: Campaign) => void;
}) {
  const { selectedCampaign, setSelectedCampaign, onCampaignSelect } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [createCampaignRecord] = useState<Campaign>({
    id: "",
    name: "",
    parent: "",
    entity: "",
  });

  const {
    getAllREST: getCampaigns,
    createREST: createCampaign,
    editREST: editCampaign,
    deleteREST: deleteCampaign,
  } = useCampaigns(responseTransformer);

  useEffect(() => {
    getCampaigns().then((responseCampaigns) => {
      if (responseCampaigns) setCampaigns(responseCampaigns);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    onResourceCreate: onCampaignCreate,
    onResourceEdit: onCampaignEdit,
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
            omitKeys={["id", "parent", "entity"]}
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
                  <SelectableCardRoot
                    resource={campaign}
                    selectedResource={selectedCampaign}
                  >
                    <Card.Body>
                      <Stack gap={6}>
                        <Card.Title>{`${campaign.name}`}</Card.Title>
                        <AutoDataList
                          record={campaignToCampaignInfo(campaign)}
                        />
                      </Stack>
                    </Card.Body>
                  </SelectableCardRoot>
                </GridItem>
              );
            })}
          </Grid>
        </Stack>
      )}
    </>
  );
}
