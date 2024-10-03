import { universalQuery } from "../helper";

function delay(timeMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });
}

export async function GET({ url }: { url: URL }) {
  let after: null | string = null;
  let pageCount = 0;
  let totalCount = 0;
  let iteratedPages = 0;
  const username = url.searchParams.get("username");

  const { profile } = await universalQuery(
    `
        query($username: String!) {
            profile(identifier: $username) {
                collectedCollectionsOrTokens {
                    count
                }
                createdCollectionsOrTokens {
                    count
                }
            }
        }
    `,
    { username }
  );

  do {
    const {
      profile: { createdCollectionsOrTokens },
    } = await universalQuery(
      `
query ($username: String!, $after: String) {
  profile(identifier: $username) {
    createdCollectionsOrTokens(after: $after) {
      pageInfo {
        endCursor
      }
      edges {
        node {
          tokenMints {
            count
          }
        }
      }
    }
  }
}
        `,
      { username, after }
    );
    after = createdCollectionsOrTokens.pageInfo.endCursor;
    pageCount = createdCollectionsOrTokens.edges.length;
    totalCount += createdCollectionsOrTokens.edges.reduce(
      (total: number, edge: any) => parseInt(edge.node.tokenMints.count) + total,
      0
    );
    iteratedPages += 1;
    await delay(100);
  } while (after && pageCount > 0 && iteratedPages <= 4);

  return new Response(
    `${profile.createdCollectionsOrTokens.count},${profile.collectedCollectionsOrTokens.count},${iteratedPages == 5 ? ">" : ""}${totalCount}`,
    {
      headers: {
        "Content-Type": "text/csv",
      },
    }
  );
}
