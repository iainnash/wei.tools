<script type="text/javascript" lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Networks } from '$lib/Networks';
	import { formatEther, getAddress, type Address, type Hex } from 'viem';
	import { getAccount, getPublicClient, getWalletClient } from '@wagmi/core';

	let request = browser
		? {
				network: parseInt($page.url.searchParams.get('network') || '0', 10),
				value: BigInt($page.url.searchParams.get('value') || '0'),
				data: ($page.url.searchParams.get('data') as Hex) || ('0x' as Hex),
				contract: getAddress($page.url.searchParams.get('contract') || '')
			}
		: undefined;

	let preview: any = undefined;
	let previewError = false;

	$: network = request && request.network && Networks[request.network];

	onMount(() => {
		request && updateData(request.data, network);
	});

	async function updateData(data: string, network: number) {
		console.log('updateData', network, data);
		if (!network) {
			return;
		}
		if (!data) {
			return;
		}
		console.log('updateData');
		const decoded = await fetch(`https://${network.etherActorPrefix}.ether.actor/decode/${data}`);
		if (decoded.ok) {
			preview = await decoded.json();
		} else {
			previewError = true;
		}
	}

	let modal: any = undefined;
	onMount(async () => {
		const module = await import('$lib/connect');
		modal = module.modal;
	});

	let selectedNetwork: any;

	$: if (modal) {
		selectedNetwork = modal.getState().selectedNetworkId;
		modal.subscribeState((newState: any) => {
			selectedNetwork = newState.selectedNetworkId;
		});
	}

	let hash: any;
	let transactionResult: any;
	let transactionError: any;

	async function sendTransaction() {
		if (!request) {
			return;
		}
		transactionError = undefined;
		try {
			const publicClient = getPublicClient(modal.wagmiConfig);
			const account = getAccount(modal.wagmiConfig);
			await publicClient.call({
				account: account.address,
				data: request.data,
				to: request.contract,
				value: request.value
			});

			const walletClient = await getWalletClient(modal.wagmiConfig);
			hash = await walletClient.sendTransaction({
				data: request.data,
				to: request.contract,
				value: request.value,
				chain: network.data
			});
			transactionResult = await publicClient.waitForTransactionReceipt({ hash });
		} catch (err: any) {
			transactionError = err;
		}
	}

	let userValidates = false;
</script>

<div>
	{#if selectedNetwork && request && request.network !== selectedNetwork}
		Please switch your wallet network to {network.data.name}
	{/if}
	{#if request}
		<pre>
Network: {network?.data.name}
Target: {request.contract}
Data: {request.data}
Value: {formatEther(request.value)}
	</pre>
	{/if}

	{#if preview}
		<pre class="preview">
		Preview:
		{JSON.stringify(preview, null, 2)}
	</pre>
	{/if}
	{#if previewError}
		Error loading preview.
	{/if}

	<br />

	<br />

	<h3>!! Warning</h3>
	<p>Ensure this transaction proposal is coming from a trusted party</p>
	<p>wei.tools assumes <strong> no </strong> liability from actions taken from this UI</p>

	<input id="disclaimer" type="checkbox" bind:value={userValidates} />
	<label for="disclaimer">I understand and wish to continue</label>

	{#if userValidates}
		<div>
			<w3m-button />

			<button on:click={sendTransaction}>Send proposed transaction</button>
			{#if transactionError}
				<pre>{transactionError.toString()}</pre>
			{/if}
			{#if hash && !transactionResult}
				<div>Waiting for transaction...</div>
				<div>{hash}</div>
				<!-- <a href={network.data.blockExplorers.default} target="_blank">View on explorer</a> -->
			{:else if hash && transactionResult}
				Transaction sent.
				<div>{JSON.stringify(transactionResult, null, 2)}</div>
			{/if}
		</div>
	{/if}

	<br />
	<br />
	<br />
	<br />
	<br />
</div>

<style>
	.preview {
		margin: 0;
		padding: 10px;
	}
</style>
