export async function GET({ params: { username } }: any) {
  const response = await fetch("https://api.zora.co/universal/graphql", {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `
            query ($username: String!) {
  viewer {
    id
  }
  profile(identifier: $username) {
    handle
    id
    createdCollectionsOrTokens {
      edges {
        __typename
        node {
          name
          __typename
        }
      }
      count
    }
  }
}
  `,
      variables: { username },
    }),
  });
  const { data } = await response.json();
  const count = data.profile.createdCollectionsOrTokens.count;
  return new Response(`${count}`, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
