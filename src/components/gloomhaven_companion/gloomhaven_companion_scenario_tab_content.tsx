import { DataList, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Scenario,
  useScenarios,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { number, object, string } from "yup";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";
import { useSearchParams } from "next/navigation";
import AddScenarioButton from "../ui/add_scenario_button";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import EditScenarioButton from "../ui/edit_scenario_button";
import { ScenarioCard } from "../ui/scenario_card";

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

  const compareScenarios = (a: Scenario, b: Scenario) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  };

  useEffect(() => {
    getScenarios().then((responseScenarios) => {
      if (responseScenarios)
        setScenarios(responseScenarios.sort(compareScenarios));
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

  useEffect(() => {
    setSelectedScenario(undefined);
  }, [selectedCampaign.id, setSelectedScenario]);

  const {
    onResourceCreate: _onScenarioCreate,
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

  const onScenarioCreate = async (
    newResource: Scenario,
    silent?: boolean,
  ): Promise<boolean> => {
    const result = await _onScenarioCreate(newResource, silent);
    if (result) {
      setScenarios((prev) => {
        return prev.sort(compareScenarios);
      });
    }
    return result;
  };

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
        setScenarios(responseScenarios.sort(compareScenarios));
      }
    } else {
      setScenarios((prev) => {
        return prev.sort(compareScenarios);
      });
    }
    return result;
  };

  const stats = [
    [0, 0, 2, 2, 1, 4],
    [1, 1, 2, 3, 2, 6],
    [2, 2, 3, 4, 2, 8],
    [3, 3, 3, 5, 2, 10],
    [4, 4, 4, 6, 3, 12],
    [5, 5, 4, 7, 3, 14],
    [6, 6, 5, 8, 3, 16],
    [7, 7, 6, 9, 4, 18],
  ];

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
            {selectedScenario?.scenarioLevel !== undefined &&
              [
                "Scenario Level",
                "Monster Level",
                "Gold Conversion",
                "Trap Damage",
                "Hazardous Terrain",
                "Bonus Experience",
              ].map((stat, index) => {
                return (
                  <GridItem colSpan={2} key={stat}>
                    <DataList.Root>
                      <DataList.Item>
                        <DataList.ItemLabel
                          marginLeft="auto"
                          marginRight="auto"
                        >
                          {stat}
                        </DataList.ItemLabel>
                        <DataList.ItemValue
                          marginLeft="auto"
                          marginRight="auto"
                        >
                          {stats[selectedScenario.scenarioLevel][index]}
                        </DataList.ItemValue>
                      </DataList.Item>
                    </DataList.Root>
                  </GridItem>
                );
              })}
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
                  <ScenarioCard
                    scenario={scenario}
                    onScenarioDelete={onScenarioDelete}
                    selected={selectedScenario?.id == scenario.id}
                  />
                </GridItem>
              );
            })}
          </Grid>
        </Stack>
      )}
    </>
  );
}
