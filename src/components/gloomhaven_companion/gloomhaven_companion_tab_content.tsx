import { Card, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AutoDataList } from "../ui/auto_data_list";
import { Campaign, useCampaigns } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_campaigns";

export function GloomhavenCompanionTabContent() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const { getAllREST: getCampaigns } = useCampaigns();

  useEffect(() => {
    getCampaigns().then((responseCampaigns) => {
      if (responseCampaigns) setCampaigns(responseCampaigns);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              >
                <Card.Root
                  variant="elevated"
                  width="95%"
                  height="95%"
                  key={`navigation-bar-${index}`}
                >
                  <Card.Body>
                    <Stack gap={6}>
                      <Card.Title>{`${campaign.name}`}</Card.Title>
                      <AutoDataList record={campaignToCampaignInfo(campaign)} />
                    </Stack>
                  </Card.Body>
                </Card.Root>
              </GridItem>
            );
          })}
        </Grid>
      )}
    </>
  )
}
