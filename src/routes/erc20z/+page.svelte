<script type="text/javascript" lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { getAccount, getPublicClient, getWalletClient } from "@wagmi/core";
  import { browser } from "$app/environment";
  import {
    erc20Abi,
    formatEther,
    parseAbi,
    parseEther,
    zeroAddress,
    type Address,
    type Chain,
  } from "viem";
  import {
    optimism,
    sepolia,
    base,
    zora,
    zoraSepolia,
    optimismSepolia,
  } from "viem/chains";
  import {
    zoraTimedSaleStrategyImplABI,
    erc20ZABI,
    royaltiesABI,
  } from "@zoralabs/erc20z";
  import AddressContainer from "../../components/address-container.svelte";

  const ZORA_TIMED_SALE_STRATEGY_ADDRESS =
    "0x777777722D078c97c6ad07d9f36801e653E356Ae";

  type ParsedZoraPath = {
    chainName: string;
    tokenAddress: string;
    tokenId: string;
  };
  type ResultData =
    | null
    | {
        erc20zBalance: bigint;
        nftBalance: bigint;
        erc20zAddress: Address;
        creatorRecipient: Address;
        royaltiesAddress: Address;
        royaltyAmount: {
          token0: Address;
          token1: Address;
          token0Amount: bigint;
          token1Amount: bigint;
        };
        noSale: false;
        saleEnd: bigint;
      }
    | { noSale: true; saleEnd: bigint };

  let resultData: ResultData = null;

  function parsePath(path: string | null | undefined): ParsedZoraPath | null {
    if (!path) {
      return null;
    }
    try {
      const uri = new URL(path);
      const [, , chainName, tokenAddress, tokenId] = uri.pathname.split(/\/|:/);
      return { chainName, tokenAddress, tokenId };
    } catch (e) {
      return null;
    }
  }

  let zoraPath = browser ? $page.url.searchParams.get("path") : undefined;

  let txnHash: string | undefined;
  let txnError: string | undefined;
  let numberSwap: number = 1;

  let option: string = "nft";

  let status: string | undefined;

  let modal: any = undefined;
  onMount(async () => {
    const module = await import("$lib/connect");
    modal = module.modal;
    console.log({ modal });
  });

  async function signMessage() {
    if (!zoraPath) {
      return;
    }

    try {
      if (!resultData || resultData?.noSale || !parsedZoraPath) {
        return;
      }
      const chain = getChainFromName(parsedZoraPath.chainName);
      const publicClient = getPublicClient(modal.wagmiConfig, {
        chainId: chain.id,
      });
      const account = getAccount(modal.wagmiConfig);
      const walletClient = await getWalletClient(modal.wagmiConfig);
      let txHash;
      if (option === "nft") {
        txHash = await walletClient.writeContract({
          chain,
          abi: parseAbi([
            "function safeTransferFrom(address, address, uint256, uint256, bytes calldata)",
          ]),
          address: parsedZoraPath?.tokenAddress as Address,
          args: [
            account.address!,
            resultData.erc20zAddress,
            BigInt(parsedZoraPath.tokenId),
            BigInt(numberSwap),
            "0x",
          ],
          functionName: "safeTransferFrom",
        });
        status = "wrapping...";
      } else {
        const allowance = await publicClient.readContract({
          abi: erc20Abi,
          functionName: "allowance",
          args: [account.address!, resultData.erc20zAddress],
          address: resultData.erc20zAddress,
        });
        const swapAmount = parseEther(numberSwap.toString());
        if (allowance < swapAmount) {
          txHash = await walletClient.writeContract({
            abi: erc20Abi,
            address: resultData.erc20zAddress,
            functionName: "approve",
            args: [resultData.erc20zAddress, swapAmount],
            chain,
          });
          status = "approving...";
        } else {
          txHash = await walletClient.writeContract({
            abi: erc20ZABI,
            functionName: "unwrap",
            args: [swapAmount, account.address!],
            address: resultData.erc20zAddress,
            chain,
          });
          status = "unwrapping...";
        }
      }
      // re-fetch user details
      if (txHash) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        status = "";
        fetchDetails(parsedZoraPath, status);
      }
      // txnHash = await walletClient.signMessage({ message: messageToSign });
    } catch (err: any) {
      txnError = err;
    }
  }

  function getChainFromName(chainName: string): Chain {
    switch (chainName) {
      case "zora":
        return zora;
      case "sep":
        return sepolia;
      case "base":
        return base;
      case "optimism":
        return optimism;
      case "zsep":
        return zoraSepolia;
      case "osep":
        return optimismSepolia;
      case "oeth":
        return optimism;
      default:
        return zora;
    }
  }

  async function fetchDetails(parsedZoraPath: ParsedZoraPath, status: any) {
    const { id: chainId } = getChainFromName(parsedZoraPath.chainName);
    const publicClient = getPublicClient(modal.wagmiConfig, { chainId });
    const account = getAccount(modal.wagmiConfig);

    const erc20zAddress = await publicClient.readContract({
      abi: zoraTimedSaleStrategyImplABI,
      functionName: "sale",
      args: [
        parsedZoraPath.tokenAddress as Address,
        BigInt(parsedZoraPath.tokenId),
      ],
      address: ZORA_TIMED_SALE_STRATEGY_ADDRESS,
    });
    if (
      erc20zAddress.erc20zAddress === zeroAddress ||
      BigInt(Math.floor(new Date().getTime() / 1000)) < erc20zAddress.saleEnd
    ) {
      console.log({ saleEnd: erc20zAddress, chainId });
      resultData = { noSale: true, saleEnd: erc20zAddress.saleEnd };
    }
    const [erc20zBalance, nftBalance, royaltiesAddress, creatorRecipient] =
      await publicClient.multicall({
        allowFailure: false,
        contracts: [
          {
            abi: erc20Abi,
            functionName: "balanceOf",
            address: erc20zAddress.erc20zAddress,
            args: [account.address as Address],
          },
          {
            abi: parseAbi([
              "function balanceOf(address,uint256) public view returns (uint256)",
            ]),
            functionName: "balanceOf",
            args: [account.address as Address, BigInt(parsedZoraPath.tokenId)],
            address: parsedZoraPath.tokenAddress as Address,
          },
          {
            abi: erc20ZABI,
            functionName: "royalties",
            address: erc20zAddress.erc20zAddress,
          },
          {
            abi: parseAbi([
              "function getCreatorRewardRecipient(uint256 tokenId) view returns (address)",
            ]),
            functionName: "getCreatorRewardRecipient",
            args: [BigInt(parsedZoraPath.tokenId)],
            address: parsedZoraPath.tokenAddress as Address,
          },
        ],
      });
    const royaltyAmount = await publicClient.readContract({
      abi: royaltiesABI,
      functionName: "getUnclaimedFees",
      address: royaltiesAddress,
      args: [erc20zAddress.erc20zAddress],
    });
    resultData = {
      noSale: false,
      royaltyAmount,
      royaltiesAddress,
      saleEnd: erc20zAddress.saleEnd,
      erc20zBalance,
      creatorRecipient,
      nftBalance: nftBalance,
      erc20zAddress: erc20zAddress.erc20zAddress,
    };
  }

  async function claimRoyalties(evt: Event) {
    evt.preventDefault();
    if (!parsedZoraPath || resultData?.noSale || !resultData) {
      return;
    }

    const chain = getChainFromName(parsedZoraPath.chainName);
    const account = getAccount(modal.wagmiConfig);
    const publicClient = getPublicClient(modal.wagmiConfig, {
      chainId: chain.id,
    });
    const walletClient = await getWalletClient(modal.wagmiConfig);

    if (!account || !account.address) {
      return;
    }

    try {
      const launchSimulate = await publicClient.simulateContract({
        address: resultData.royaltiesAddress,
        abi: royaltiesABI,
        functionName: "claim",
        args: [resultData?.erc20zAddress, account.address],
      });
      const txnHash = await walletClient.writeContract(launchSimulate.request);
      status = "claiming...";
      if (txnHash) {
        await publicClient.waitForTransactionReceipt({ hash: txnHash });
        status = "";
        fetchDetails(parsedZoraPath, status);
      }
    } catch (err: any) {
      status = err.metaMessages?.join(",") || err.toString();
    }
  }

  async function startSale(evt: Event) {
    evt.preventDefault();

    if (!parsedZoraPath) {
      return;
    }

    const chain = getChainFromName(parsedZoraPath.chainName);
    const publicClient = getPublicClient(modal.wagmiConfig, {
      chainId: chain.id,
    });
    const walletClient = await getWalletClient(modal.wagmiConfig);

    const launchSimulate = await publicClient.simulateContract({
      address: ZORA_TIMED_SALE_STRATEGY_ADDRESS,
      abi: zoraTimedSaleStrategyImplABI,
      functionName: "launchMarket",
      args: [
        parsedZoraPath.tokenAddress as Address,
        BigInt(parsedZoraPath.tokenId),
      ],
    });
    const txnHash = await walletClient.writeContract(launchSimulate.request);
    status = "launching market...";
    if (txnHash) {
      await publicClient.waitForTransactionReceipt({ hash: txnHash });
      status = "";
      fetchDetails(parsedZoraPath, status);
    }
  }

  $: parsedZoraPath = parsePath(zoraPath);
  $: parsedZoraPath && modal && fetchDetails(parsedZoraPath, status);
  $: zoraPath && $page.url.searchParams.set("path", zoraPath);
</script>

<div>
  <div>
    <w3m-button />
  </div>

  <form class="trade" on:submit={signMessage}>
    I have a mint from this ZORA page
    <input
      class="uri"
      type="text"
      bind:value={zoraPath}
      placeholder="https://zora.co/collect/zora:"
    />
    {#if resultData && resultData.noSale}
      No secondary sale started for this token yet.
      <br />
      This sale ends at {new Date(
        Number(resultData.saleEnd) * 1000
      ).toISOString()}
      {#if Number(resultData.saleEnd) * 1000 >= new Date().getTime()}
        <br />
        This sale can be manually started –
        <input type="submit" on:click={startSale} value="Start sale" />
      {/if}
    {:else if parsedZoraPath}
      and I have the associated&nbsp;
      <select bind:value={option}>
        <option value="nft"
          >ZORA NFT {#if resultData}
            ({resultData?.nftBalance}){/if}</option
        >
        <option value="tokens"
          >ERC20Z Tokens {#if resultData}
            ({formatEther(resultData?.erc20zBalance)}){/if}</option
        >
      </select>

      that I want to swap for
      <input class="count" type="number" bind:value={numberSwap} />
      associated
      {#if option === "tokens"}
        NFTs{:else}
        ERC20z{/if}.

      <input
        disabled={!!status}
        class="submit"
        type="submit"
        value={status ? status : "Execute"}
      />
    {/if}
  </form>
  <div class="btm"></div>
  {#if resultData && !resultData.noSale && parsedZoraPath?.chainName}
    <div>
      <div>
        ERC20Z Address: <AddressContainer
          chain={getChainFromName(parsedZoraPath.chainName)}
          address={resultData.erc20zAddress}
        />
      </div>
      <div>
        Chain: <AddressContainer
          chain={getChainFromName(parsedZoraPath.chainName)}
        />
      </div>
      <div>
        NFT Address: <AddressContainer
          chain={getChainFromName(parsedZoraPath.chainName)}
          address={parsedZoraPath?.tokenAddress}
        />
      </div>
      <div>
        NFT ID: <AddressContainer
          chain={getChainFromName(parsedZoraPath.chainName)}
          address={parsedZoraPath?.tokenAddress}
        />
      </div>
      <div>
        Royalties:
        <pre>{resultData.royaltyAmount.token0 ===
          "0x4200000000000000000000000000000000000006"
            ? "WETH"
            : "ERC20Z"}: {formatEther(
            (resultData.royaltyAmount.token0Amount * 3n) / 4n
          )}</pre>
        <pre>{resultData.royaltyAmount.token1 ===
          "0x4200000000000000000000000000000000000006"
            ? "WETH"
            : "ERC20Z"}: {formatEther(
            (resultData.royaltyAmount.token1Amount * 3n) / 4n
          )}</pre>
        <pre><button on:click={claimRoyalties}>claim royalties</button
          > for {resultData.creatorRecipient}</pre>
      </div>
    </div>
  {/if}
</div>

<style>
  form.trade {
    margin-top: 34px;
    line-height: 54px;
  }
  form.trade,
  form.trade input,
  form.trade select {
    font-size: 34px;
  }
  form.trade input,
  form.trade select {
    border: 0 none;
    border-bottom: 2px solid #444;
  }
  form.trade input.uri {
    width: 100%;
  }
  form.trade input.submit,
  form.trade input.uri {
    margin-top: 10px;
    margin-bottom: 10px;
    display: block;
  }
  form.trade input.count {
    width: 60px;
  }
  .btm {
    margin-top: 400px;
  }
</style>
