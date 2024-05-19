import { fetchQuery, init } from "@airstack/node";

export type LensSearchResult = {
  userAddress: string;
  profileName: string;
  dappName: string;
  profileImage: string;
  userAssociatedAddresses: string[];
  profileTokenId: string;
};

init(process.env.AIRSTACK_API_KEY!);

export const searchLensBuilderProfiles = async (
  query: string,
): Promise<LensSearchResult[]> => {
  const airstackQuery = `
  query QueryUserOnLensAndFarcaster {
    Socials(
      input: {
        filter: {
            dappName: { _in: [lens] },
            profileName: { _regex: "${query}" }
        },
        blockchain: ethereum
      }
    ) {
      Social {
        userAddress
        dappName
        profileName
        profileImage
        userAssociatedAddresses
        profileTokenId
      }
    }
  }
`;
  try {
    const response = await fetchQuery(airstackQuery);

    if (response.error) {
      console.error("Error fetching airstack lens profiles ", response.error);
      return [];
    }
    const data: LensSearchResult[] = response.data?.Socials?.Social ?? [];
    return data;
  } catch (error) {
    console.error("Error fetching LensBuilder profiles ", error);
    return [];
  }
};

export const getLensBuilderProfile = async (
  walletId: string,
): Promise<LensSearchResult | null> => {
  if (!walletId) return null;
  const query = `query QueryUserOnLensAndFarcaster {
      Socials(
          input: {
              filter: {
                  dappName: { _in: [lens] },
                  identity: { _eq: "${walletId.toLowerCase()}" }
              },
              blockchain: ethereum
          }
      ) {
          Social {
              userAddress
              dappName
              profileName
              profileImage
              userAssociatedAddresses
              profileTokenId
          }
      }
    }`;

  try {
    const result = await fetchQuery(query);
    if (result.error) {
      console.error("Error fetching airstack lens profile ", result.error);
      return null;
    }

    const socials = result.data.Socials.Social;
    if (!socials || socials.length === 0) return null;

    const lensSocial = socials.find(
      (social: any) => social.dappName === "lens",
    ) as LensSearchResult | undefined;

    return lensSocial || null;
  } catch (error) {
    console.error("Error fetching LensBuilder profile ", error);
    return null;
  }
};
