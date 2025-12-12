import { SelectableCardRoot } from "./selectable_card_root";
import { useMemo } from "react";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { Card, Stack } from "@chakra-ui/react";
import { Button } from "../recipes/button";
import { IoCloseSharp } from "react-icons/io5";
import { AutoDataList } from "./auto_data_list";

export function ScenarioCard(props: {
  scenario: Scenario;
  selected: boolean;
  onScenarioDelete: (scenario: Scenario, silent?: boolean) => Promise<boolean>;
}) {
  const { scenario, selected, onScenarioDelete } = props;

  const scenarioCard = useMemo(() => {
    const scenarioInfo = {
      Name: scenario.name,
      "Scenario Level": scenario.scenarioLevel,
      Enemies: scenario.groups,
    };
    return (
      <SelectableCardRoot selected={selected}>
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
            <AutoDataList record={scenarioInfo} />
          </Stack>
        </Card.Body>
      </SelectableCardRoot>
    );
  }, [scenario, selected, onScenarioDelete]);

  return scenarioCard;
}
