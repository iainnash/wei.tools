import { universalQuery } from "../helper";

export async function GET({ url }: { url: URL }) {
  let after: undefined | string = undefined;
  let pageCount = 0;
  let totalCount = 0;
  let iteratedPages = 0;

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
      { username: url.searchParams.get("username"), after }
    );
    after = createdCollectionsOrTokens.pageInfo.endCursor;
    pageCount = createdCollectionsOrTokens.edges.length;
    console.log(createdCollectionsOrTokens);
    totalCount += createdCollectionsOrTokens.edges.reduce(
      (total: number, edge: any) => edge.node.tokenMints.count + total,
      0
    );
    iteratedPages += 1;
  } while (after !== undefined && pageCount > 0 && iteratedPages <= 4);

  return new Response(`${iteratedPages == 5 && ">"}${totalCount}`, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
