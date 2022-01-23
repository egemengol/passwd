<script>
	import { createEventDispatcher } from 'svelte';

	export let tableData;
	export let isSyncing;

	const dispatch = createEventDispatcher();
	function doRemoveRow(index) {
		console.log('dispatches');
		dispatch('removeRow', index);
	}
</script>

<table>
	<thead>
		<tr>
			<th>Username</th>
			<th>Password</th>
			<th>Remove?</th>
		</tr>
	</thead>
	<tbody>
		{#each Object.values(tableData) as row, i}
			<tr>
				{#each Object.values(row) as cell}
					<td class:gray={isSyncing}>{cell}</td>
				{/each}
				<td class:gray={isSyncing}>
					<span on:click={() => doRemoveRow(i)}>×</span>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.gray {
		color: gray;
	}
</style>
