<script type="text/javascript" lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";

  type ParsedZoraPath = {
    chainName: string;
    tokenAddress: string;
    tokenId: string;
  };

  let zoraPath = browser ? $page.url.searchParams.get("path") : undefined;
  let parsedZoraPath: ParsedZoraPath | undefined = undefined;

  let returnData: any = {error: 'no path'};

  async function getMetadataInfo(parsedPath: ParsedZoraPath | undefined) {
    if (!parsedZoraPath) {
      returnData = { error: "no uri" };
      return;
    }

    returnData = { status: 'loading' };

    try {
      const response = await fetch(
        `https://${getEtherActorDomainFromChainName(parsedPath.chainName)}.ether.actor/nft/${parsedZoraPath.tokenAddress}/${parsedZoraPath.tokenId}.json`
      );
      const responseJson = await response.json();
      returnData = responseJson;
    } catch (e: any) {
      returnData = { error: "cannot fetch" };
    }
  }

  function parsePath(
    path: string | null | undefined
  ): ParsedZoraPath | undefined {
    if (!path) {
      return undefined;
    }

    try {
      const uri = new URL(path);
      const [, , chainName, tokenAddress, tokenId] = uri.pathname.split(/\/|:/);
      return { chainName, tokenAddress, tokenId };
    } catch (e) {
      return undefined;
    }
  }

  function getEtherActorDomainFromChainName(chainName: string): string {
    switch (chainName) {
      case "eth":
        return "mainnet";
      default:
        return chainName;
    }
  }

  $: parsedZoraPath = parsePath(zoraPath);
  $: parsedZoraPath && getMetadataInfo(parsedZoraPath);
  $: zoraPath && $page.url.searchParams.set("path", zoraPath);
</script>

<div>
  <form class="metadata" on:submit={() => getMetadataInfo(parsedZoraPath)}>
    I have a mint from this ZORA page
    <input
      class="uri"
      type="text"
      bind:value={zoraPath}
      placeholder="https://zora.co/collect/zora:"
    />
    and i want to debug the metadata:

    {#if returnData}
      <pre>{JSON.stringify(returnData, null, 2)}</pre>
    {/if}
  </form>
  <div class="btm"></div>
</div>

<style>
  form.metadata {
    margin-top: 34px;
    line-height: 54px;
    font-size: 34px;
  }
  form.metadata input {
    border: 0 none;
    border-bottom: 2px solid #444;
    font-size: 34px;
  }
  form.metadata input.uri {
    width: 100%;
  }
  form.metadata input.uri {
    margin-top: 10px;
    margin-bottom: 10px;
    display: block;
  }
  .btm {
    margin-top: 400px;
  }
</style>
