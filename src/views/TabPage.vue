<template>
	<router-view v-slot="{ Component }">
		<component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
	</router-view>
</template>

<script setup>
	import { useRoute } from 'vue-router'

	const route = useRoute()

	defineOptions({
		name: 'tab-page',
	})
</script>

<style lang="less" scoped></style>
