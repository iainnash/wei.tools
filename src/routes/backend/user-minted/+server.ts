import { universalQuery } from "../helper";

export async function GET({ url }: { url: URL }) {
  const {
    profile: {
      collectedCollectionsOrTokens: { count },
    },
  } = await universalQuery(
    `
    query ($username: String!) {
      profile(identifier: $username) {
        collectedCollectionsOrTokens {
          count
        }
      }
    }
  `,
    { username: url.searchParams.get("username") }
  );

  return new Response(`${count}`, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
