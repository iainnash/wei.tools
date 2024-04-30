<script type="text/javascript" lang="ts">
	import { Networks } from '$lib/Networks';
	import { onMount } from 'svelte';
	import { isAddress, isHex, parseEther } from 'viem';
	import { goto } from '$app/navigation';

	let selectedNetwork: undefined | number = undefined;

	let modal: any = undefined;
	onMount(async () => {
		const module = await import('$lib/connect');
		modal = module.modal;
	});

	$: if (modal) {
		selectedNetwork = modal.getState().selectedNetworkId;
		modal.subscribeState((newState: any) => {
			selectedNetwork = newState.selectedNetworkId;
		});
	}

	let targetContract: string = '';
	let abi: any = [];
	let targetFunction = '$$$_raw';
	let inputData: string = '0x';
	let inputValue: string = '0';

	$: network = selectedNetwork && Networks[selectedNetwork];

	async function updateTargetContract(evt: any) {
		const targetContract = evt.target.value;
		const abiResponse = await fetch(
			`https://${network.etherActorPrefix}.ether.actor/${targetContract}/abi.json`
		);
		const abiJson = await abiResponse.json();
		if (Array.isArray(abiJson)) {
			abi = abiJson;
		}
	}

	function isEtherValue(value: string) {
		try {
			parseEther(value);
			return true;
		} catch (err: any) {
			return false;
		}
	}

	$: filteredAbis = abi.filter((item: any) => item.type === 'function');
	$: chosenAbi = abi.find((item: any) => item.name === targetFunction);
	$: isValid = !!(isAddress(targetContract) && isHex(inputData) && isEtherValue(inputValue));

	function formSubmit(evt: any) {
		evt.preventDefault();
		goto(
			`/e?network=${selectedNetwork}&contract=${targetContract}&value=${inputValue}&data=${inputData}`
		);
	}
</script>

<div>
	<form on:submit={formSubmit}>
		<h3>Set up a transaction to share</h3>

		<div>
			<w3m-button />
		</div>

		<p>
			Target chain: {network?.data.name}
		</p>
		<p>
			<label for="targetContract">Target contract:</label>
			<input
				id="targetContract"
				type="text"
				class={isAddress(targetContract) ? 'valid' : 'invalid'}
				bind:value={targetContract}
				on:change={updateTargetContract}
			/>
		</p>
		<p>
			Function:
			<select bind:value={targetFunction}>
				<option value="$$$_raw">RAW</option>
				{#each filteredAbis as abi}
					<option disabled value={abi.name}>{abi.name}</option>
				{/each}
			</select>
		</p>
		{#if chosenAbi}
			<p>
				Input:
				<!-- {#each chosenAbi.inputs as abi}
                {#if abi.type === 'address'}

                {:else if abi.type.startsWith('uint')}
                {/if}
            {/each} -->
			</p>
		{:else}
			<p>
				<label for="inputData">Input:</label>
				<textarea
					id="inputData"
					class={isHex(inputData) ? 'valid' : 'invalid'}
					bind:value={inputData}
				/>
				<label for="inputValue">Value:</label>
				<input
					id="inputValue"
					class={isEtherValue(inputValue) ? 'valid' : 'invalid'}
					bind:value={inputValue}
				/>
			</p>
		{/if}
		<input disabled={!isValid} type="submit" value="Create URL" />
	</form>
</div>

<style>
	label {
		display: block;
	}

	.invalid {
		border: red 1px solid;
	}
	.valid {
		border: green 1px solid;
	}
</style>
