import { Card, Grid, GridItem, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Figure, useFigures } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { number, object, string } from "yup";
import CRUDButtons from "../ui/crud_buttons";
import { responseTransformer } from "@/app/utils/gloomhaven_companion_service/response_transformer";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { useOnCRUD } from "@/app/utils/rest/use_on_crud";
import { SelectableCardRoot } from "../ui/selectable_card_root";
import { FigureDataList } from "../ui/figure_data_list";
import { Button } from "../recipes/button";
import { IoCloseSharp } from "react-icons/io5";
import { FaRegClone } from "react-icons/fa";

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
                    <Card.Body paddingTop="0px" paddingLeft="12px" paddingBottom="18px" paddingRight="0px">
                      <Stack gap={6}>
                        <Card.Title>
                          <Stack direction="row" alignItems="center" gap="0">
                            <Text>{`${figure.name}`}</Text>
                            <Button
                              paddingLeft="1"
                              paddingBottom="2"
                              borderWidth="0"
                              onClick={() => onFigureCreate(figure)}
                              _hover={{
                                color: "green"
                              }}><FaRegClone />
                            </Button>
                            <Button
                              marginLeft="auto"
                              onClick={() => onFigureDelete(figure)}
                              _hover={{
                                color: "red"
                              }}><IoCloseSharp />
                            </Button>
                          </Stack>
                        </Card.Title>
                        <FigureDataList figure={figure} onFigureEdit={onFigureEdit} />
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
