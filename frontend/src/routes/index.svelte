<script lang="ts">
	import { onMount } from 'svelte';
	import Table from './Table.svelte';
	import { ethers } from 'ethers';
	import Store from '../../../contract/artifacts/contracts/Store.sol/Store.json';
	import * as nacl from 'tweetnacl';
	import * as naclUtil from 'tweetnacl-util';
	import MetamaskCrypt from '../MetamaskCrypt';

	let provider;
	let signer;
	let address;
	let encryptionPubkey;
	let store;

	let newUsername = '';
	let newPassword = '';
	let secrets = null;
	let isSyncing = true;

	const delay = () => new Promise((resolve) => setTimeout(resolve, 500));
	const getEncryptionPubkey = (ethereum, address): string =>
		ethereum
			.request({
				method: 'eth_getEncryptionPublicKey',
				params: [address] // you must have access to the specified account
			})
			.then((result) => {
				return result;
			})
			.catch((error) => {
				if (error.code === 4001) {
					// EIP-1193 userRejectedRequest error
					console.log("We can't encrypt anything without the key.");
				} else {
					console.error(error);
				}
			});

	const encrypt = (publicKey, data): string => {
		const ephemeralKeyPair = nacl.box.keyPair();

		// assemble encryption parameters - from string to UInt8
		let pubKeyUInt8Array;
		try {
			pubKeyUInt8Array = naclUtil.decodeBase64(publicKey);
		} catch (err) {
			throw new Error('Bad public key');
		}

		const msgParamsUInt8Array = naclUtil.decodeUTF8(data);
		const nonce = nacl.randomBytes(nacl.box.nonceLength);

		// encrypt
		const encryptedMessage = nacl.box(
			msgParamsUInt8Array,
			nonce,
			pubKeyUInt8Array,
			ephemeralKeyPair.secretKey
		);

		// handle encrypted data
		const output = {
			version: 'x25519-xsalsa20-poly1305',
			nonce: naclUtil.encodeBase64(nonce),
			ephemPublicKey: naclUtil.encodeBase64(ephemeralKeyPair.publicKey),
			ciphertext: naclUtil.encodeBase64(encryptedMessage)
		};
		// const hexString = ethers.utils.formatBytes32String(JSON.stringify(output));
		// return hexString;
		// return ethers.utils.hexlify(Buffer.from(JSON.stringify(output), 'utf8'));
		return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(JSON.stringify(output)));
	};

	onMount(async () => {
		const mc = new MetamaskCrypt(window.ethereum);
		try {
			secrets = await mc.read();
		} catch (error) {
			console.log(error.message);
			alert(error.message);
		}
		isSyncing = false;
	});

	async function upload() {
		isSyncing = true;
		if (!encryptionPubkey) {
			encryptionPubkey = await getEncryptionPubkey(window.ethereum, address);
		}
		const encrypted = encrypt(encryptionPubkey, JSON.stringify(secrets));
		await store.set(encrypted);
		isSyncing = false;
	}

	async function add() {
		console.log('user', newUsername, 'pass', newPassword);
		if (secrets && newPassword !== '' && newUsername !== '') {
			console.log('here');
			secrets = [...secrets, { username: newUsername, password: newPassword }];
			newUsername = '';
			newPassword = '';
			await upload();
		}
	}

	async function remove(event) {
		const index = event.detail;
		if (secrets && secrets.length > index) {
			secrets.splice(index, 1);
			secrets = secrets;
			await upload();
		}
	}
</script>

<input type="text" bind:value={newUsername} placeholder="Username" />
<input type="password" bind:value={newPassword} placeholder="Password" />
<button on:click={add}>Add</button>

<br />

{#if secrets}
	<Table tableData={secrets} bind:isSyncing on:removeRow={remove} />
{/if}

<!-- {#each secrets as secret, i}
	<span on:click={() => remove(i)}>× </span>
{/each} -->
