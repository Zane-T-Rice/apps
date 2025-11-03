import { Card, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AutoDataList } from "../ui/auto_data_list";
import { Scenario, useScenarios } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { object, string } from "yup";
import { fetchWithValidateAndToast } from "@/app/utils/fetch/fetch_with_validate_and_toast";
import CRUDButtons from "../ui/crud_buttons";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";

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
  campaign: Campaign;
}) {
  const { campaign } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>();
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
  } = useScenarios(campaign.id, responseTransformer);

  useEffect(() => {
    getScenarios().then((responseScenarios) => {
      if (responseScenarios) setScenarios(responseScenarios);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  const onScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const onScenarioCreate = async (newScenario: Scenario): Promise<boolean> => {
    const title = `Creating scenario ${newScenario.name}`;
    const scenario = await fetchWithValidateAndToast({
      title,
      setErrors: setCreateErrors,
      validateCallback: () => {
        return createScenarioSchema.validateSync(newScenario, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await createScenario(validate),
    });
    if (!scenario) return false;

    // Update scenarios with new record
    setScenarios((prev) => {
      return [...prev, scenario];
    });

    return true;
  };

  const onScenarioEdit = async (newScenario: Scenario): Promise<boolean> => {
    const title = `Editing scenario ${newScenario.name}`;
    const scenario = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return editScenarioSchema.validateSync(newScenario, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await editScenario(validate),
    });
    if (!scenario) return false;

    // Update scenarios with edited record if success
    setScenarios((prev) => {
      return prev.map((currentScenario) =>
        currentScenario.id === scenario.id ? scenario : currentScenario
      );
    });
    setSelectedScenario(scenario)

    return true;
  };

  const onScenarioDelete = async (scenarioToDelete: Scenario): Promise<boolean> => {
    const title = `Deleting scenario ${scenarioToDelete.name}`;
    const scenario = await fetchWithValidateAndToast({
      title,
      setErrors: setEditErrors,
      validateCallback: () => {
        return deleteScenarioSchema.validateSync(scenarioToDelete, {
          abortEarly: false,
        });
      },
      fetchCallback: async (validate) => await deleteScenario(validate),
    });
    if (!scenario) return false;

    setScenarios((prev) => {
      return prev.filter((currentScenario) => currentScenario.id !== scenario.id);
    });
    setSelectedScenario(undefined);

    return true;
  };

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
