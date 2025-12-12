import { Text } from "@chakra-ui/react";
import { SelectableCardRoot } from "./selectable_card_root";
import { useCallback, useMemo, useState } from "react";
import { Campaign } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";
import { Card, Stack } from "@chakra-ui/react";
import { Button } from "../recipes/button";
import { AutoDataList } from "./auto_data_list";
import { AlertDialog } from "./alert_dialog";
import { fetchWithToast } from "@/app/utils/fetch/fetch_with_toast";
import {
  JoinCampaign,
  useCreateJoinCampaignCode,
} from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_create_join_campaign_code";

export function CampaignCard(props: { campaign: Campaign; selected: boolean }) {
  const { campaign, selected } = props;
  const [joinCampaign, setJoinCampaign] = useState<JoinCampaign>();
  const { actionREST: actionCreateJoinCampaignCode } =
    useCreateJoinCampaignCode();

  const generateJoinCode = useCallback(
    async (campaign: Campaign) => {
      const response = await fetchWithToast(
        "Generating Invite Code",
        async () => {
          return await actionCreateJoinCampaignCode(
            campaign,
            "create-join-code",
          );
        },
      );
      if (response) {
        setJoinCampaign(response);
      }
    },
    [actionCreateJoinCampaignCode],
  );

  const joinCodeBody = useCallback(() => {
    return <Text>{joinCampaign ? joinCampaign.code : null}</Text>;
  }, [joinCampaign]);

  const campaignCard = useMemo(() => {
    const campaignInfo = {
      Name: campaign.name,
    };
    return (
      <SelectableCardRoot selected={selected}>
        <Card.Body>
          <Stack gap={3}>
            <Card.Title>{`${campaign.name}`}</Card.Title>
            <AutoDataList record={campaignInfo} />
            <AlertDialog
              trigger={
                <Button
                  variant="safe"
                  onClick={() => generateJoinCode(campaign)}
                >
                  Generate Join Code
                </Button>
              }
              onConfirm={() => null}
              confirmVariant="safe"
              titleText="This join code is good for 5 minutes."
              body={joinCodeBody()}
            />
          </Stack>
        </Card.Body>
      </SelectableCardRoot>
    );
  }, [campaign, selected, generateJoinCode, joinCodeBody]);

  return campaignCard;
}
