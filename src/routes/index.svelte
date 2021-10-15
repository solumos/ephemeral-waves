<script lang="ts">
	import Control from '$lib/Control.svelte';
	import Message from '$lib/Message.svelte';
	import { waveCount, waves } from '$lib/stores';
</script>

<svelte:head>
	<title>waves</title>
</svelte:head>

<section>
	<div class="mainContainer">
		<div class="dataContainer">
			<div class="header">welcome to waves</div>
			<div class="bio">
				waves are ephemeral messages - a maximum of 10 waves can exist at one time
			</div>
			<div class="bio">
				if you send me a wave, there's a chance you could win some (fake) ether!
			</div>
			<div class="bio">connect your ethereum wallet and send me a wave!</div>

			<div class="bio">total waves: {$waveCount}</div>

			<Control />

			{#each $waves as message}
				<Message data={message} />
			{/each}
		</div>
	</div>
</section>
