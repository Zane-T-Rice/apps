import { Card, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AutoDataList } from "../ui/auto_data_list";
import { Figure, useFigures } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { number, object, string } from "yup";
import CRUDButtons from "../ui/crud_buttons";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";
import { SelectableCardRoot } from "../ui/selectable_card_root";

const createFigureSchema = object({
  name: string().required(),
  maximumHP: number().integer().required(),
  damage: number().integer().required(),
}).stripUnknown();

const editFigureSchema = createFigureSchema
  .concat(
    object({
      id: string().required(),
    })
  )
  .stripUnknown();

const deleteFigureSchema = object({
  id: string().required(),
}).stripUnknown();

export function GloomhavenCompanionFigureTabContent(props: {
  selectedCampaign: Campaign;
  selectedScenario: Scenario;
}) {
  const { selectedCampaign, selectedScenario } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [selectedFigure, setSelectedFigure] = useState<Figure>();
  const [createErrors, setCreateErrors] = useState<{
    [Property in keyof Figure]?: string;
  }>({});
  const [editErrors, setEditErrors] = useState<{
    [Property in keyof Figure]?: string;
  }>({});
  const [createFigureRecord] = useState<Figure>({
    id: "",
    parent: "",
    entity: "",
    name: "",
    maximumHP: 0,
    damage: 0
  });

  const {
    getAllREST: getFigures,
    createREST: createFigure,
    editREST: editFigure,
    deleteREST: deleteFigure,
  } = useFigures(selectedCampaign.id, selectedScenario.id, responseTransformer);

  useEffect(() => {
    getFigures().then((responseFigures) => {
      if (responseFigures) setFigures(responseFigures);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, selectedScenario]);

  const onFigureSelect = (figure: Figure) => {
    setSelectedFigure(figure);
  };

  const {
    onResourceCreate: onFigureCreate,
    onResourceEdit: onFigureEdit,
    onResourceDelete: onFigureDelete
  } = useOnCRUD<
    Figure,
    typeof createFigureSchema,
    typeof editFigureSchema,
    typeof deleteFigureSchema
  >({
    resourceNameKey: "name",
    setCreateErrors,
    setEditErrors,
    createResourceSchema: createFigureSchema,
    editResourceSchema: editFigureSchema,
    deleteResourceSchema: deleteFigureSchema,
    createResource: createFigure,
    editResource: editFigure,
    deleteResource: deleteFigure,
    setResources: setFigures,
    setSelectedResource: setSelectedFigure,
  })

  const figureToFigureInfo = (figure: Figure) => ({
    HP: `${figure.maximumHP - figure.damage} / ${figure.maximumHP}`
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
            selectedRecord={selectedFigure}
            onCreate={onFigureCreate}
            creationRecord={createFigureRecord}
            onEdit={onFigureEdit}
            onCreateErrors={createErrors}
            onEditErrors={editErrors}
            onDelete={onFigureDelete}
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
            {figures.map((figure, index) => {
              return (
                <GridItem
                  colSpan={1}
                  key={`navigation-bar-grid-item-${index}`}
                  justifyItems="center"
                  onClick={() => onFigureSelect(figure)}
                >
                  <SelectableCardRoot
                    resource={figure}
                    selectedResource={selectedFigure}
                  >
                    <Card.Body>
                      <Stack gap={6}>
                        <Card.Title>{`${figure.name}`}</Card.Title>
                        <AutoDataList record={figureToFigureInfo(figure)} />
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
  )
}
