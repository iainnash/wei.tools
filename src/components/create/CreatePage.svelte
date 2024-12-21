<script type="text/javascript" lang="ts">
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import ContractsSelector from "./ContractsSelector.svelte";
  import NewTokenForm from "./NewTokenForm.svelte";

  import {
    getAccount,
    getChainId,
    getPublicClient,
    getWalletClient,
  } from "@wagmi/core";
  import {
    createCreatorClient,
    toContractCreationConfigOrAddress,
  } from "@zoralabs/protocol-sdk";
  import {
    getMediaDetails,
    toIPFSUri,
    uploadFile,
    uploadJSON,
  } from "$lib/uploader";
  import type { Address } from "viem";

  let modal: any = undefined;
  const selectedNetwork = writable<number | undefined>(undefined);
  const walletAddress = writable<string | undefined>(undefined);
  const selectedContract = writable<
    | { address: string; type: "existing" }
    | { name: string; uri: string; type: "new" }
    | undefined
  >(undefined);

  onMount(async () => {
    const module = await import("$lib/connect");
    modal = module.modal;
  });

  $: if (modal) {
    walletAddress.set(getAccount(modal.wagmiConfig).address);
    selectedNetwork.set(modal.getState().selectedNetworkId);

    modal.subscribeState((newState: any) => {
      selectedNetwork.set(newState.selectedNetworkId);
    });
  }

  function onContractSelect(address: string) {
    selectedContract.set({ address, type: "existing" });
    console.log("selected network", $selectedNetwork, address);
  }

  const formActivity = writable<string[]>([]);

  async function uploadAndSetMetadata(values: any) {
    const imageUri = toIPFSUri(await uploadFile(values.image as File));
    let mediaUri = values.media
      ? toIPFSUri(await uploadFile(values.media as File))
      : undefined;

    let metadataUri = toIPFSUri(
      await uploadJSON(
        {
          name: values.name,
          description: values.description,
          image: imageUri,
          animation_uri: mediaUri,
          ...getMediaDetails(values.media as File | undefined, mediaUri),
        },
        "metadata.json"
      )
    );

    return metadataUri;
  }

  async function onNewContract(values: any) {
    const uri = await uploadAndSetMetadata(values);
    selectedContract.set({ name: values.name, uri, type: "new" });
  }

  async function onSubmit(values: any) {
    const { wagmiConfig } = modal;

    let thisActions: string[] = [];
    thisActions.push("Uploading media...");
    formActivity.set(thisActions);

    const uri = await uploadAndSetMetadata(values);

    thisActions.push("Loading onchain parameters...");
    formActivity.set(thisActions);

    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = await getPublicClient(wagmiConfig);

    const creatorClient = createCreatorClient({
      chainId: getChainId(wagmiConfig),
      publicClient: publicClient as any,
    });
    const selectedContract = $selectedContract!;

    let parameters;
    if (selectedContract.type === "existing") {
      const result = await creatorClient.create1155OnExistingContract({
        account: walletClient.account,
        token: {
          tokenMetadataURI: uri,
        },
        contractAddress: selectedContract.address as Address,
      });
      parameters = result.parameters;
    } else {
      const result = await creatorClient.create1155({
        account: walletClient.account,
        token: {
          tokenMetadataURI: uri,
        },
        contract: {
          name: selectedContract.name,
          uri: selectedContract.uri,
        },
      });
      parameters = result.parameters;
    }

    const simulation = publicClient.simulateContract(parameters as any);
    console.log({ simulation });
    const result = await walletClient.writeContract(parameters as any);

    thisActions.push("Sending mint to wallet...");
    formActivity.set(thisActions);

    console.log({ result });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: result,
    });

    thisActions.push("Minted!");
    formActivity.set(thisActions);

    setTimeout(() => {
      formActivity.set([]);
    }, 5000);
  }
</script>

<w3m-button />

<p>Selected Network: {$selectedNetwork}</p>
<p>Wallet Address: {$walletAddress}</p>
<p>Selected Contract: {JSON.stringify($selectedContract || {})}</p>

{#if $walletAddress}
  <ContractsSelector
    walletAddress={$walletAddress}
    selectedNetwork={$selectedNetwork}
    selectedContract={$selectedContract}
    {onNewContract}
    {onContractSelect}
  />

  {#if $selectedContract}
    <NewTokenForm
      header="Create new token on contract"
      actions={$formActivity}
      {onSubmit}
    />
  {/if}
{:else}
  Connect wallet above.
{/if}
