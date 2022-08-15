<template>
	<div class="main">
		<slot />
	</div>
</template>

<script setup>
	defineOptions({
		name: 'layout',
	})
</script>

<style lang="less" scoped>
	.main {
		min-width: 100vw;
		min-height: 100vh;
	}
</style>
