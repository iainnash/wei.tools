<script type="text/javascript" lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getAccount, getPublicClient, getWalletClient } from '@wagmi/core';
	import { browser } from '$app/environment';

	let defaultToSign = browser ? $page.url.searchParams.get('message') : undefined;
	let desiredUser = browser ? $page.url.searchParams.get('desiredUser') : undefined;
	let messageToSign = defaultToSign;

	let transactionError: any;

	let signedMessageHash: string | undefined;

	let modal: any = undefined;
	onMount(async () => {
		const module = await import('$lib/connect');
		modal = module.modal;
	});

	async function signMessage() {
		if (!messageToSign) {
			return;
		}
		try {
			const publicClient = getPublicClient(modal.wagmiConfig);
			const account = getAccount(modal.wagmiConfig);
			const walletClient = await getWalletClient(modal.wagmiConfig);
			signedMessageHash = await walletClient.signMessage({ message: messageToSign });
		} catch (err: any) {
			transactionError = err;
		}
	}

	let userValidates = false;
</script>

<div>
	{#if defaultToSign}
		<pre>
Message to sign: {defaultToSign}
{#if desiredUser}User: {desiredUser}{/if}
	</pre>
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

			<form on:submit={signMessage}>
				<label style="display:block">
					Message to sign:
					<br />
					<br />
					<input bind:value={messageToSign} />
				</label>
				<br />
				<input type="submit" value="Sign proposed message" />
				{#if transactionError}
					<pre>{transactionError.toString()}</pre>
				{/if}
				{#if signedMessageHash}
					<div>
						Message signed:
						<pre>{signedMessageHash}</pre>
					</div>
				{/if}
			</form>
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
