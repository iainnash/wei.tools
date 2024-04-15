<script type="text/javascript" lang="ts">
    import {
        isHex,
        fromHex,
        formatEther,
        pad,
        hexToString,
        formatGwei,
        parseGwei,
        parseEther,
        zeroAddress
    } from 'viem';
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

    let hex = '0x0';
    $: decimal = errorOr(() => fromHex(hex as Hex, 'number').toString());
    $: text = errorOr(() => hexToString(hex as Hex).toString());

    const onChangeWei = (evt: any) => {
        if (isHex(evt.target.value)) {
            const hexInt = fromHex(evt.target.value, 'bigint');
            wei = hexInt.toString();
        }
    };

    const onKeyGwei = (evt: any) => {
        const value = evt.target.value;
        try {
            wei = parseGwei(value).toString();
        } catch (err: any) {}
    };

    const onKeyEth = (evt: any) => {
        wei = parseEther(evt.target.value).toString();
    };

    const selectAndCopy = (evt: any) => {
        evt.target.select();
        document.execCommand('copy');
    };
</script>

<h1 class="h">wei.tools</h1>
<section class="page">
    <form class="f">
        <h3 class="h">eth converter utils</h3>
        <div class="form">
            <label for="wei">Wei <sup>(10^0)</sup></label>
            <div><input id="wei" type="text" bind:value={wei} on:change={onChangeWei} /></div>
            <label for="gwei">Gwei <sup>(10^9)</sup></label>
            <div><input id="gwei" type="text" bind:value={gwei} on:keyup={onKeyGwei} /></div>
            <label for="ether">Ether <sup>(10^18)</sup></label>
            <div><input id="ether" type="text" bind:value={eth} on:keyup={onKeyEth} /></div>
        </div>
    </form>

    <form class="f">
        <h3 class="h">hex utils</h3>
        <div class="form">
            <label for="hex">Hex Data</label>
            <input id="hex" type="text" bind:value={hex} />
            <label for="decimal">Decimal Data</label>
            <input id="decimal" type="text" bind:value={decimal} />
            <label for="text">Text Data</label>
            <input id="text" type="text" bind:value={text} />
        </div>
    </form>

    <form class="f">
        <h3 class="h">constants</h3>
        <label for="zero">Zero Address</label>
        <input id="zero" type="text" value={zeroAddress} on:click={selectAndCopy} />
        <label for="zerobytes32">Zero Bytes32</label>
        <input id="zerobytes32" type="text" value={pad('0x')} on:click={selectAndCopy} />
    </form>
</section>

<style>
    .page {
        max-width: 80%;
        min-width: 400px;
        margin: 0 auto;
    }

    h1.h {
        font-size: 1.7em;
        padding: 20px;
    }

    .h,
    .f {
        font-family: Helvetica;
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
        font-size: 1.2em;
        width: 100%;
    }

    .form {
        display: grid;
        align-items: center;
    }

    @media only screen and (min-width: 600px) {
        .form {
            grid-template-columns: 1fr 3fr;
        }
    }
</style>
