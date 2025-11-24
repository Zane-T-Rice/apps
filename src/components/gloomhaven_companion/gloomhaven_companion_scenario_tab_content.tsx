import { Card, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AutoDataList } from "../ui/auto_data_list";
import {
  Scenario,
  useScenarios,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { number, object, string } from "yup";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";
import { SelectableCardRoot } from "../ui/selectable_card_root";
import { useSearchParams } from "next/navigation";
import AddScenarioButton from "../ui/add_scenario_button";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import EditScenarioButton from "../ui/edit_scenario_button";
import { IoCloseSharp } from "react-icons/io5";
import { Button } from "../recipes/button";

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
  onScenarioSelect: (scenario: Scenario) => void;
  templates: Template[];
}) {
  const {
    selectedCampaign,
    selectedScenario,
    setSelectedScenario,
    onScenarioSelect,
    templates,
  } = props;
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

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
  }, [getScenarios]);

  useEffect(() => {
    if (selectedScenario) return;
    if (searchParams.get("scenarioId")) {
      const scenario = scenarios?.find(
        (scenario) => scenario.id === searchParams.get("scenarioId"),
      );
      setSelectedScenario((prev) => {
        if (prev && selectedScenario === undefined) {
          return prev;
        } else {
          return scenario;
        }
      });
    }
  }, [scenarios, searchParams, selectedScenario, setSelectedScenario]);

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
          <Grid
            key={`add-buttons`}
            templateColumns={{
              base: "repeat(6, 1fr)",
            }}
            gap="3"
            marginLeft={3}
            marginRight={3}
          >
            <GridItem colSpan={3}>
              <AddScenarioButton
                onCreate={onScenarioCreate}
                templates={templates}
              />
            </GridItem>
            <GridItem colSpan={3}>
              <EditScenarioButton
                onEdit={onScenarioEdit}
                templates={templates}
                scenario={selectedScenario}
              />
            </GridItem>
          </Grid>
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
                        <Stack direction="row" gap={0} alignItems="center">
                          <Card.Title>{`${scenario.name}`}</Card.Title>
                          <Button
                            marginLeft="auto"
                            onClick={() => onScenarioDelete(scenario, true)}
                            _hover={{
                              color: "red",
                            }}
                          >
                            <IoCloseSharp />
                          </Button>
                        </Stack>
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
