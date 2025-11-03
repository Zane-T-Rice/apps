import { Card, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AutoDataList } from "../ui/auto_data_list";
import { Scenario, useScenarios } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { object, string } from "yup";
import CRUDButtons from "../ui/crud_buttons";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";

const createScenarioSchema = object({
  name: string().required(),
}).stripUnknown();

const editScenarioSchema = createScenarioSchema
  .concat(
    object({
      id: string().required(),
    })
  )
  .stripUnknown();

const deleteScenarioSchema = object({
  id: string().required(),
}).stripUnknown();

export function GloomhavenCompanionScenarioTabContent(props: {
  selectedCampaign: Campaign;
  selectedScenario?: Scenario;
  setSelectedScenario: Dispatch<SetStateAction<Scenario | undefined>>;
}) {
  const { selectedCampaign, selectedScenario, setSelectedScenario } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof Scenario]?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    [Property in keyof Scenario]?: string;
  }>({});
  const [createScenarioRecord] = useState<Scenario>({
    id: "",
    name: "",
    parent: "",
    entity: ""
  });

  const {
    getAllREST: getScenarios,
    createREST: createScenario,
    editREST: editScenario,
    deleteREST: deleteScenario,
  } = useScenarios(selectedCampaign.id, responseTransformer);

  useEffect(() => {
    getScenarios().then((responseScenarios) => {
      if (responseScenarios) setScenarios(responseScenarios);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign]);

  const onScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const {
    onResourceCreate: onScenarioCreate,
    onResourceEdit: onScenarioEdit,
    onResourceDelete: onScenarioDelete
  } = useOnCRUD<
    Scenario,
    typeof createScenarioSchema,
    typeof editScenarioSchema,
    typeof deleteScenarioSchema
  >({
    resourceNameKey: "name",
    setCreateErrors,
    setEditErrors,
    createResourceSchema: createScenarioSchema,
    editResourceSchema: editScenarioSchema,
    deleteResourceSchema: deleteScenarioSchema,
    createResource: createScenario,
    editResource: editScenario,
    deleteResource: deleteScenario,
    setResources: setScenarios,
    setSelectedResource: setSelectedScenario,
  })

  const scenarioToScenarioInfo = (scenario: Scenario) => ({
    Name: scenario.name,
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
            selectedRecord={selectedScenario}
            onCreate={onScenarioCreate}
            creationRecord={createScenarioRecord}
            onEdit={onScenarioEdit}
            onCreateErrors={createErrors}
            onEditErrors={editErrors}
            onDelete={onScenarioDelete}
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
            {scenarios.map((scenario, index) => {
              return (
                <GridItem
                  colSpan={1}
                  key={`navigation-bar-grid-item-${index}`}
                  justifyItems="center"
                  onClick={() => onScenarioSelect(scenario)}
                >
                  <Card.Root
                    variant="elevated"
                    width="95%"
                    height="95%"
                    key={`navigation-bar-${index}`}
                  >
                    <Card.Body>
                      <Stack gap={6}>
                        <Card.Title>{`${scenario.name}`}</Card.Title>
                        <AutoDataList record={scenarioToScenarioInfo(scenario)} />
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
