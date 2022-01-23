<script lang="ts">
	import { onMount } from 'svelte';
	import Table from './Table.svelte';
	import { MetamaskCrypt } from '../lib';

	let metamaskCrypt: MetamaskCrypt | null;

	interface Secret {
		username: string;
		password: string;
	}
	let secrets: Secret[] = [];
	let newUsername = '';
	let newPassword = '';
	let isSyncing = true;

	onMount(async () => {
		metamaskCrypt = new MetamaskCrypt((window as any).ethereum);
		try {
			secrets = await metamaskCrypt.read();
		} catch (error) {
			console.log(error.message);
			alert(error.message);
		}
		isSyncing = false;
	});

	async function upload() {
		isSyncing = true;
		await metamaskCrypt.write(secrets);
		isSyncing = false;
	}

	async function add() {
		if (secrets && newPassword !== '' && newUsername !== '') {
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

<Table tableData={secrets} bind:isSyncing on:removeRow={remove} />
