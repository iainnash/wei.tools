<script lang="ts">
  import type { Chain } from "viem";

    export let address: undefined | string;
    export let chain: Chain;

</script>

{#if address}
<pre>{address} <a href={`https://${chain.blockExplorers?.default.url}/address/${address}`}>go</a></pre>
{:else}
<pre>{chain.name}</pre>
{/if}


<style>

</style>