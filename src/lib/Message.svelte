<script lang="ts">
	export let data;
</script>

<div class="message">
	<div>
	  <span role="img" aria-label="letter">
		✉
	  </span>
	  ️ msg: {data.message}
	</div>
	<div>
	  <span role="img" aria-label="clock">
		️️️️️️🕙
	  </span>{" "}
	  time: {data.timestamp.toISOString()}
	</div>
	<div>
	  <span role="img" aria-label="outbox">
		️️️️️️📤
	  </span>{" "}
	  addr: {data.address}
	</div>
</div>
