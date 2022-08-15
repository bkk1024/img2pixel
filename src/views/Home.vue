<template>
	<layout>
		<div class="home">
			<!-- 上方选择相关参数 -->
			<el-row>
				<el-col>
					<el-card>
						<!-- 控制下方展示类型 -->
						<div class="numInput">
							<el-switch v-model="state.isDefaultShow" class="mb-2" inactive-text="默认展示" active-text="表格展示" style="--el-switch-on-color: #00b294; --el-switch-off-color: #00b294; --el-color-primary: #00b294" />
						</div>
						<!-- 控制显隐 -->
						<div class="numInput">
							<el-switch v-model="state.isPxSize" class="mb-2" active-text="图片总大小" inactive-text="每个像素块大小" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #13ce66; --el-color-primary: #13ce66" />
						</div>
						<!-- 像素块大小 -->
						<div class="numInput" v-if="!state.isPxSize">
							<!-- <span>像素化图片的每个像素块大小</span> -->
							<el-input-number v-model="state.pxSize" :min="1" />
						</div>
						<!-- 图片上下最多多少个像素块 -->
						<div class="numInput" v-else>
							<!-- <span>像素化图片上下最多多少个像素块</span> -->
							<el-input-number v-model="state.howMany" :min="10" />
						</div>
						<!-- 缩放大小 -->
						<div class="numInput" v-if="state.scale">
							<span>原图片缩放大小</span>
							<el-input-number v-model="state.scale" :min="1" :max="10" />
						</div>
					</el-card>
				</el-col>
			</el-row>
			<!-- 图片预览和处理部分 -->
			<default-show v-if="!state.isDefaultShow" :isPxSize="state.isPxSize" :howMany="state.howMany" :pxSize="state.pxSize" :scale="state.scale" />
			<table-show v-else :isPxSize="state.isPxSize" :howMany="state.howMany" :pxSize="state.pxSize" :scale="state.scale" />
		</div>
	</layout>
</template>

<script setup>
	import layout from '@/layout/Index.vue'
	import DefaultShow from '@/components/DefaultShow.vue'
	import TableShow from '@/components/TableShow.vue'
	import { reactive } from 'vue'

	defineOptions({
		name: 'home',
	})

	const state = reactive({
		// 被像素化的图片上下最多多少个像素块
		howMany: 20,
		// 图片放大倍数
		scale: 0,
		// 每个像素块替换原图片中多少个像素块，如果 howMany > 0，则本变量不由用户输入决定，而是由图片的高度和 howMany 决定
		pxSize: 7,
		// 控制显示 pxSize 或者 howMany 的控件
		isPxSize: false,
		// 展示组件控制，default-show 或者 table-show
		isDefaultShow: false,
	})
</script>

<style lang="less" scoped>
	.home {
		width: 100%;
		height: 100%;

		:deep(.el-row) {
			display: flex;
			justify-content: space-between;
			padding: 20px 10px 0;

			.el-card {
				.numInput {
					display: inline-block;
					margin-right: 20px;
				}
			}
		}
	}
</style>
