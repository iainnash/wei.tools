<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import {
    arbitrum,
    base,
    baseSepolia,
    optimism,
    zora,
    zoraSepolia,
  } from "viem/chains";
  import NewTokenForm from "./NewTokenForm.svelte";

  export let walletAddress: string | undefined;
  export let selectedNetwork: number | undefined;
  export let selectedContract:
    | { address: string; type: "existing" }
    | { name: string; uri: string; type: "new" }
    | undefined;

  export let onContractSelect;

  const getNetwork = (networkId: number | undefined) => {
    switch (networkId) {
      case base.id:
        return "base-mainnet";
      case baseSepolia.id:
        return "base-sepolia";
      case zoraSepolia.id:
        return "zora-sepolia";
      case zora.id:
        return "zora-mainnet";
      case optimism.id:
        return "optimism";
      case arbitrum.id:
        return "arbitrum-one";
      default:
        return null;
    }
  };

  export let onNewContract;

  $: graphqlEndpoint = `https://api.goldsky.com/api/public/project_clhk16b61ay9t49vm6ntn4mkz/subgraphs/zora-create-${getNetwork(selectedNetwork)}/stable/gn`;

  // GraphQL query
  const query = `
      query ($owner: Bytes) {
        zoraCreateContracts(where: {owner: $owner, contractStandard: "ERC1155"}) {
          timestamp
          contractStandard
          contractVersion
          contractURI
          metadata {
            name
            image
            description
          }
          address
        }
      }
    `;

  // Query function for Svelte Query
  async function fetchContracts({ queryKey }: { queryKey: [string, string] }) {
    console.log({ queryKey });
    const [, address] = queryKey;
    if (!address) return [];

    try {
      const response = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { owner: address },
        }),
      });

      const result = await response.json();
      return result.data?.zoraCreateContracts || [];
    } catch (error) {
      console.error("Error fetching contracts:", error);
      throw error;
    }
  }

  $: contractsQuery = createQuery({
    enabled: !!walletAddress,
    queryKey: ["contracts", walletAddress || "none"],
    queryFn: fetchContracts,
  });
</script>

<h3>Contracts</h3>
<ul>
  {#if $contractsQuery.isLoading}
    <li>Loading contracts...</li>
  {:else if $contractsQuery.isError}
    <li>Error loading contracts: {$contractsQuery.error.message}</li>
  {:else if $contractsQuery.data?.length === 0}
    <li>No contracts found for this address.</li>
  {:else if $contractsQuery.isSuccess}
    {#each $contractsQuery.data as contract}
      {#if selectedContract === undefined || selectedContract === contract.address}
        <li>
          <strong>{contract.metadata.name}</strong> - {contract.address}
          <p>{contract.metadata.description}</p>
          {#if selectedContract === undefined}
            <button on:click={onContractSelect(contract.address)}>Select</button
            >
          {:else}
            <button on:click={onContractSelect(undefined)}>Unselect</button>
          {/if}
        </li>
      {/if}
    {/each}
  {/if}
</ul>

{#if !selectedContract}
  <NewTokenForm
    header="Create a new contract"
    actions={[]}
    onSubmit={onNewContract}
  />
{/if}

{#if selectedContract?.type === "new"}
  <div>
    <div>
      Creating new contract with: {selectedContract.name} ({selectedContract.uri})
    </div>
    <button on:click={onContractSelect(undefined)}>Change / edit</button>
  </div>
{/if}
