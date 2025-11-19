import { Card, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AutoDataList } from "../ui/auto_data_list";
import {
  Scenario,
  useScenarios,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { number, object, string } from "yup";
import CRUDButtons from "../ui/crud_buttons";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";
import { SelectableCardRoot } from "../ui/selectable_card_root";
import { useSearchParams } from "next/navigation";

const createScenarioSchema = object({
  name: string().required(),
  scenarioLevel: number().integer().required(),
  groups: string().required(),
}).stripUnknown();

const editScenarioSchema = createScenarioSchema
  .concat(
    object({
      id: string().required(),
      updatedAt: string().required(),
    }),
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
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [createScenarioRecord] = useState<Scenario>({
    id: "",
    name: "",
    parent: "",
    entity: "",
    scenarioLevel: 0,
    groups: "",
    updatedAt: null,
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
      if (searchParams.get("scenarioId")) {
        const scenario = responseScenarios?.find(
          (scenario) => scenario.id === searchParams.get("scenarioId"),
        );
        if (scenario) {
          setSelectedScenario(scenario);
        }
      }
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign]);

  const onScenarioSelect = (scenario: Scenario) => {
    if (scenario.entity === selectedScenario?.entity) return;
    setSelectedScenario(scenario);
  };

  const {
    onResourceCreate: onScenarioCreate,
    onResourceEdit: _onScenarioEdit,
    onResourceDelete: onScenarioDelete,
  } = useOnCRUD<
    Scenario,
    typeof createScenarioSchema,
    typeof editScenarioSchema,
    typeof deleteScenarioSchema
  >({
    resourceNameKey: "name",
    createResourceSchema: createScenarioSchema,
    editResourceSchema: editScenarioSchema,
    deleteResourceSchema: deleteScenarioSchema,
    createResource: createScenario,
    editResource: editScenario,
    deleteResource: deleteScenario,
    setResources: setScenarios,
    setSelectedResource: setSelectedScenario,
  });

  const onScenarioEdit = async (
    newResource: Scenario,
    silent?: boolean,
  ): Promise<boolean> => {
    const result = await _onScenarioEdit(newResource, silent);
    // Try to freshen the data. Edit failures are usually from stale data
    // with old updatedAt values.
    if (!result) {
      const responseScenarios = await getScenarios();
      if (responseScenarios) {
        setScenarios(responseScenarios);
      }
    }
    return result;
  };

  const scenarioToScenarioInfo = (scenario: Scenario) => ({
    Name: scenario.name,
    "Scenario Level": scenario.scenarioLevel,
    Enemies: scenario.groups,
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
        <Stack gap={3}>
          <CRUDButtons
            omitKeys={["id", "parent", "entity", "updatedAt"]}
            selectedRecord={selectedScenario}
            createPermission="gloomhaven-companion:public"
            creationRecord={createScenarioRecord}
            onCreate={onScenarioCreate}
            createResourceSchema={createScenarioSchema}
            editPermission="gloomhaven-companion:public"
            onEdit={onScenarioEdit}
            editResourceSchema={editScenarioSchema}
            deletePermission="gloomhaven-companion:public"
            onDelete={onScenarioDelete}
          />
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
            {scenarios.map((scenario, index) => {
              return (
                <GridItem
                  colSpan={1}
                  key={`navigation-bar-grid-item-${index}`}
                  justifyItems="center"
                  onClick={() => onScenarioSelect(scenario)}
                >
                  <SelectableCardRoot
                    resourceId={scenario.id}
                    selectedResourceId={selectedScenario?.id}
                  >
                    <Card.Body>
                      <Stack gap={3}>
                        <Card.Title>{`${scenario.name}`}</Card.Title>
                        <AutoDataList
                          record={scenarioToScenarioInfo(scenario)}
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
