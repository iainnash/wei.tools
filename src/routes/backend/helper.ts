export const universalQuery = async (query: string, variables: any) => {
  const response = await fetch("https://api.zora.co/universal/graphql", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  if (response.ok) {
    const { data } = await response.json();
    return data;
  }
  console.log(response.status)
  console.log(response.statusText)
  throw new Error("Bad response");
};
