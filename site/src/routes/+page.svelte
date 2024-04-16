<script type="text/javascript" lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		isHex,
		fromHex,
		formatEther,
		pad,
		hexToString,
		formatGwei,
		parseGwei,
		parseEther,
		stringToHex,
		numberToHex,
		zeroAddress,
		isAddress,
		getAddress
	} from 'viem';
    import {debounce} from '$lib/debounce';
    import {currency, currencyFourDecimals} from '$lib/currency';
	import type { Hex } from 'viem';


	let wei = '0';
	$: gwei = formatGwei(BigInt(wei));
	$: eth = formatEther(BigInt(wei));

	function errorOr(stmt: () => string) {
		try {
			return stmt();
		} catch (err: any) {
			return '';
		}
	}

	let hex = '0x';
	$: decimal = errorOr(() => fromHex(hex as Hex, 'bigint').toString());
	$: text = errorOr(() => hexToString(hex as Hex).toString());

    let decodedCalldata: string | null = null;

    const [debounceHex, clearDebounceHex] = debounce(async (req) => {
        decodedCalldata = '';
        const response = await fetch(`https://ether.actor/decode/${hex}`)
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        decodedCalldata = JSON.stringify(data, null, 2);
    }, 300);

    let ethUsd: number = 0;
    $: usdValue = currencyFourDecimals.format(parseFloat(formatEther(BigInt(wei))) * ethUsd);
    const onUSDChange = (evt: any) => {
        const data = parseFloat(evt.target.value)
        wei = parseEther((data / ethUsd).toString()).toString();
    }

    onMount(async () => {
        const response = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot')
        const {data: {amount}} = await response.json()
        ethUsd = amount;
    });

    onDestroy(() => {
        clearDebounceHex();
    });


	let address = '';
	$: addressLowercased = address.toLowerCase();

	const onChangeAddress = (evt: any) => {
		const value = evt.target.value;
		if (isAddress(value)) {
			address = getAddress(value);
		}
	};

	const onChangeWei = (evt: any) => {
		if (isHex(evt.target.value)) {
			const hexInt = fromHex(evt.target.value, 'bigint');
			wei = hexInt.toString();
		}
	};

	const onKeyGwei = (evt: any) => {
		const value = evt.target.value;
		try {
			if (!value.includes('*')) {
				wei = parseGwei(value).toString();
			}
		} catch (err: any) {
			console.error(err);
		}
	};

	const onChangeGwei = (evt: any) => {
		const value = evt.target.value;
		if (value.includes('*')) {
			const [left, right] = value.split('*');
			wei = (parseGwei(left.trim()) * BigInt(right.replace(/[kK]/, '000').trim() || '1')).toString();
		}
	};

	const onKeyEth = (evt: any) => {
		wei = parseEther(evt.target.value).toString();
	};

	const selectAndCopy = (evt: any) => {
		evt.target.select();
		document.execCommand('copy');
	};

	const onChangeHexDecimal = (evt: any) => {
		hex = numberToHex(BigInt(evt.target.value));
	};

	const onChangeHexText = (evt: any) => {
		hex = stringToHex(evt.target.value);
	};
</script>

<h1 class="h">wei.tools</h1>
<p>a small catalogue of ethereum developer tools</p>
<section class="page">
	<form class="f">
		<h3 class="h">eth converter utils</h3>
		<div class="form">
			<label for="wei">Wei <sup>(10^0)</sup></label>
			<div><input id="wei" type="text" bind:value={wei} on:change={onChangeWei} /></div>
			<label for="gwei">Gwei <sup>(10^9)</sup></label>
			<div>
				<input
					id="gwei"
					type="text"
					bind:value={gwei}
					on:keyup={onKeyGwei}
					on:change={onChangeGwei}
				/>
			</div>
			<label for="ether">Ether <sup>(10^18)</sup></label>
			<div><input id="ether" type="text" bind:value={eth} on:keyup={onKeyEth} /></div>
			<label for="usd">USD <small>{currency.format(ethUsd)}/eth</small></label>
			<div><input id="usd" type="text" bind:value={usdValue} on:change={onUSDChange} /></div>
		</div>
	</form>

	<form class="f">
		<h3 class="h">hex utils</h3>
		<div class="form">
			<label for="hex">Hex Data</label>
			<input id="hex" type="text" on:change={debounceHex} bind:value={hex} />
			<label for="decimal">Decimal Data</label>
			<input id="decimal" type="text" bind:value={decimal} on:keyup={onChangeHexDecimal} />
			<label for="text">Text Data</label>
			<input id="text" type="text" bind:value={text} on:keyup={onChangeHexText} />
            {#if decodedCalldata}
            <label for="decodedCalldata">Decoded calldata</label>
            <pre id="decoded">{decodedCalldata}</pre>
            {/if}
		</div>
	</form>

	<form class="f">
		<h3 class="h">address utils</h3>
		<div class="form">
			<label for="address">checksummed address</label>
			<input id="address" type="text" bind:value={address} on:change={onChangeAddress} />
			<label for="address">lowercased address</label>
			<input id="address" type="text" bind:value={addressLowercased} on:change={onChangeAddress} />
		</div>
	</form>

	<form class="f">
		<h3 class="h">constants</h3>
		<label for="zero">Zero Address</label>
		<input id="zero" type="text" value={zeroAddress} on:click={selectAndCopy} />
		<label for="zerobytes32">Zero Bytes32</label>
		<input id="zerobytes32" type="text" value={pad('0x')} on:click={selectAndCopy} />
	</form>

    <br />
    <br />
    <br />
    <br />
    <footer>
        by <a href="https://warpcast.com/iain">iain</a>
    </footer>
</section>

<style>
	.page {
		max-width: 85%;
		min-width: 400px;
		margin: 0 auto;
	}

    .page, h1.h {
		font-family: Helvetica, Arial, sans-serif;
    }

	h1.h {
		font-size: 1.7em;
		padding: 20px;
	}

	.h,
	.f {
		font-size: 1.2em;
	}

	.f label {
		padding: 4px 0;
		margin: 10px 0;
		display: block;
	}

	.f input {
		padding: 4px;
		display: block;
		margin: 10px 0;
		font-size: 1em;
		width: calc(100% - 20px);
	}

	.form {
		display: grid;
		align-items: center;
	}

    .page footer {
        text-align: center;
        padding-bottom: 30px;
    }

	@media only screen and (min-width: 800px) {
		.f input {
			font-size: 1.2em;
		}
		.form {
			grid-template-columns: 1fr 3fr;
		}
	}
</style>
