import { universalQuery } from "../helper";

export async function GET({ url }: { url: URL }) {
  const {
    profile: {
      createdCollectionsOrTokens: { count },
    },
  } = await universalQuery(
    `
    query ($username: String!) {
      profile(identifier: $username) {
        createdCollectionsOrTokens {
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
