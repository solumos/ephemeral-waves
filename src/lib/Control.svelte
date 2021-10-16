<script lang="ts">
	import { onMount } from 'svelte';
	import { ethers } from "ethers";
	import {contractAddress, contractABI} from "./constants";
	import { currentAccount, networkReady, walletEnabled, waves, waveCount } from './stores';

	let ethereum;
	let contract;
	let loading = false;
	let failed = false;

	async function setAccount(ethereum) {
		const accounts = await ethereum.request({ method: 'eth_accounts' });
		if (accounts.length !== 0) {
			const account = accounts[0];
			$currentAccount = account;
			console.log('Found an authorized account:', account);
			return true;
		} else {
			console.log('No authorized account found');
			return false;
		}
	}

	async function connectWallet() {
		if (!ethereum) {
			console.log('no wallet');
			return;
		}

		try {
			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			console.log('Connected', accounts[0]);
			$currentAccount = accounts[0];
		} catch (error) {
			console.log(error);
		}

		await initNetwork();
	}

	async function changeNetwork() {
		if (!ethereum) {
			console.log('no wallet');
			return;
		}
		try {
			await ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: '0x4' }]
			});

			$networkReady = true;
		} catch (error) {
			console.log(error);
		}
		await initNetwork();
	}

	async function submit(e) {
		if (!ethereum) {
			console.log('no wallet');
			return;
		}

		const message = e.target[0].value;
	
		let waveTxn;
		try {
			waveTxn = await contract.wave(message, { gasLimit: 300000 });
		} catch (error) {
			console.log(error);
			failed = true;
			return;
		}

		loading = true;

        console.log("Mining...", waveTxn.hash);

		try {
        	await waveTxn.wait();
		} catch (error) {
			console.log(error);
			loading = false;
			failed = true;
			return;
		}

		loading = false;
        console.log("Mined -- ", waveTxn.hash);
	}

	async function initNetwork() {
		if (!window.ethereum) {
			return;
		}

		if (ethereum.networkVersion !== '4') {
			return;
		}

		$networkReady = true;

		const provider = new ethers.providers.Web3Provider(window.ethereum);
      	const signer = provider.getSigner();
      	contract = new ethers.Contract(contractAddress, contractABI, signer);

		const rawWaves = await contract.getAllWaves();
		const totalWaves = await contract.getTotalWaves();

		let wavesCleaned = [];
		rawWaves.forEach((wave) => {
			if (wave.waver === "0x0000000000000000000000000000000000000000") {
				return;
			}

			wavesCleaned.unshift({
				address: wave.waver,
				timestamp: new Date(wave.timestamp * 1000),
				message: wave.message,
			});
		});

		$waves = wavesCleaned;
		$waveCount = totalWaves.toNumber();

		contract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          waves.update((arr) => [
            {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message,
            },
            ...arr.slice(0, 9),
          ]);

		  waveCount.update(n => n+1);
        });
	}

	onMount(async () => {
		if (!window.ethereum) {
			return;
		}

		ethereum = window.ethereum;

		$walletEnabled = true;

		const accountSet = await setAccount(ethereum);
		if (!accountSet) {
			return;
		}
		
		ethereum.on("chainChanged", (e) => {
			if (e === '0x4') {
				$networkReady = true;
				initNetwork();
			} else {
				$networkReady = false;
			}
      	});

		await initNetwork();
	});
</script>

<!-- <div class="control"> -->
	{#if !$walletEnabled}
		<form action="https://metamask.io/">
			<button class="clickButton">
				<span role="img" aria-label="fox emoji"> 🦊 </span>{' '}
				get metamask {' '}
				<span role="img" aria-label="fox emoji"> 🦊 </span>
			</button>
		</form>
	{:else if !$currentAccount}
		<button class="clickButton" on:click={connectWallet}>
			<span role="img" aria-label="electric plug"> 🔌 </span>{' '}
			connect wallet{' '}
			<span role="img" aria-label="electric plug"> 🔌 </span>
		</button>
	{:else if !$networkReady}
		<button class="clickButton" on:click={changeNetwork}>
			<span role="img" aria-label="do not enter sign"> ⛔ </span>{' '}
			wrong network - click here to change{' '}
			<span role="img" aria-label="do not enter sign"> ⛔ </span>
		</button>
	{:else if loading}
		<button class="msgButton" on:click={changeNetwork}>
			<span role="img" aria-label="do not enter sign"> ⌛ </span>{' '}
			waiting for txn...{' '}
			<span role="img" aria-label="do not enter sign"> ⌛ </span>
		</button>
	{:else if failed}
		<button class="clickButton" on:click={() => console.log("working on it")}>
			<span role="img" aria-label="do not enter sign"> ⚠️ </span>{' '}
			transaction failed - wait 15 minutes!{' '}
			<span role="img" aria-label="do not enter sign"> ⚠️ </span>
		</button>
	{:else}
		<form on:submit|preventDefault={submit}>
			<input
				placeholder="enter message"
				type="text"
				name="message"
			/>
			<button class="clickButton" type="submit">
				<span role="img" aria-label="wave"> 🌊 </span>{' '}
				send wave{' '}
				<span role="img" aria-label="wave"> 🌊 </span>
			</button>
			<button class="msgButton">
				<span role="img" aria-label="check"> ✅ </span>{' '}
				「{$currentAccount.slice(0, 6)}...{$currentAccount.slice(38)}」 connected{' '}
				<span role="img" aria-label="check"> ✅ </span>
			</button>
		</form>
	{/if}
<!-- </div> -->
