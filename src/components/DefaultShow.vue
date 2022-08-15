<template>
	<el-row :gutter="10">
		<!-- 左侧选择图片进行预览 -->
		<el-col :span="12">
			<el-card class="userImg">
				<div>
					<el-upload action="#" v-model:file-list="fileList" list-type="picture-card" :auto-upload="false" :on-preview="handlePictureCardPreview" :on-remove="handleRemove">
						<el-icon><Plus /></el-icon>
					</el-upload>
				</div>
				<div class="canvas" v-for="(item, index) in fileList" :key="index" hidden>
					<canvas :id="`#canvasMy${item.uid}`" :ref="canvasMyList"></canvas>
					<canvas :id="`#canvasGenerate${item.uid}`" :ref="canvasGenerateList"></canvas>
				</div>
			</el-card>
		</el-col>
		<!-- 右侧展示像素画图片 -->
		<el-col :span="12">
			<!-- <div> -->
			<el-card class="generateImg" v-if="generateFileList.length">
				<el-card v-for="(item, index) in generateFileList" :key="index">
					<img :src="item.url" class="image" />
					<div class="generateIcon" style="padding-top: 10px">
						<el-icon @click="checkImg(item.url)"><ZoomIn /></el-icon>
						<a :href="item.url" :download="item.uid">
							<el-icon @click="downImg(item.url)"><Download /></el-icon>
						</a>
					</div>
				</el-card>
			</el-card>
			<!-- </div> -->
		</el-col>
	</el-row>
	<!-- 弹窗预览 -->
	<el-dialog v-model="dialogVisible" title="图片预览">
		<img class="dialogImg" :src="dialogImageUrl" alt="Preview Image" />
	</el-dialog>
</template>

<script setup>
	import { ref, nextTick, watch, defineProps } from 'vue'
	import { ElLoading } from 'element-plus'

	defineOptions({
		name: 'default-show',
	})

	const props = defineProps({
		isPxSize: {
			type: Boolean,
			default: false,
		},
		howMany: {
			type: Number,
			default: 20,
		},
		pxSize: {
			type: Number,
			default: 7,
		},
		scale: {
			type: Number,
			default: 0,
		},
	})

	const fileList = ref([]) // 保存用户选择的图片
	const generateFileList = ref([]) // 保存处理后的图片

	const canvasMy = ref([])
	const canvasMyList = (el) => {
		if (!canvasMy.value.includes(el)) {
			canvasMy.value.push(el)
		}
	}

	const canvasGenerate = ref([])
	const canvasGenerateList = (el) => {
		if (!canvasGenerate.value.includes(el)) {
			canvasGenerate.value.push(el)
		}
	}

	watch(fileList, (newValue, oldValue) => {
		console.log('newValue', newValue)
		console.log('oldValue', oldValue)
		if (newValue.length > oldValue.length && fileList.value.length) {
			// 用户新添加了一个图片
			nextTick(() => {
				const ctxMy = canvasMy.value[canvasMy.value.length - 1].getContext('2d')
				const ctxGenerate = canvasGenerate.value[canvasGenerate.value.length - 1].getContext('2d')
				const uid = newValue[newValue.length - 1].uid
				GenerateImg(canvasMy.value[canvasMy.value.length - 1], ctxMy, canvasGenerate.value[canvasGenerate.value.length - 1], ctxGenerate, uid)
			})
		}
	})

	const dialogImageUrl = ref('')
	const dialogVisible = ref(false)

	const handlePictureCardPreview = (uploadFile) => {
		dialogImageUrl.value = uploadFile.url
		dialogVisible.value = true
	}

	const handleRemove = (uploadFile, uploadFiles) => {
		// 同步删除像素化的图片
		generateFileList.value = generateFileList.value.filter((item) => {
			if (item.uid != uploadFile.uid) {
				return item
			}
		})
	}

	const checkImg = (url) => {
		dialogImageUrl.value = url
		dialogVisible.value = true
	}

	const downImg = (url) => {
		// window.open(url)
	}

	const GenerateImg = (canvasMy, ctxMy, canvasGenerate, ctxGenerate, uid) => {
		const loading = ElLoading.service({
			lock: true,
			text: 'Loading',
		})
		const myImg = new Image()
		myImg.setAttribute('crossOrigin', 'Anonymous')

		myImg.src = fileList.value[fileList.value.length - 1].url

		myImg.onload = function () {
			// 设置图片上下最多多少个像素点
			const howMany = props.howMany
			// 设置图片放大倍数
			// const scale = props.scale
			const scale = 1
			// 获取原图片的宽高，其中包含用户选择的放大或缩小倍数
			const realW = myImg.width * scale
			const realH = myImg.height * scale
			// 设置像素点大小
			const pxSize = !props.isPxSize ? props.pxSize : Math.floor(realH / howMany)
			const selfW = Math.floor(realW / pxSize)
			const selfH = Math.floor(realH / pxSize)
			// 给 canvasMy 设置宽高
			canvasMy.width = selfW
			canvasMy.height = selfH
			// 将用户上传的这张图片绘制到 canvasMy 中，以便获取图片颜色信息
			ctxMy.drawImage(myImg, 0, 0, selfW, selfH)
			// 获取 canvasMy 中的图片信息
			const imgMyData = ctxMy.getImageData(0, 0, selfW, selfH)
			// console.log('imgMyData', imgMyData)
			// 将像素数值转换成颜色，添加进列表
			//  获取到的颜色数组每四个值表示一个颜色，分别为r，g，b，a
			let RGBAList = []
			for (let i = 0; i < imgMyData.data.length; i += 4) {
				// rgba 最后一个值用小数表示透明度，最大值为 1 ，所以需要将其除以 255 得到一个最大为 1 的小数
				RGBAList.push(`rgba(${imgMyData.data[i]}, ${imgMyData.data[i + 1]}, ${imgMyData.data[i + 2]}, ${imgMyData.data[i + 3] / 255})`)
			}

			// 展示像素画
			canvasGenerate.width = realW
			canvasGenerate.height = realH
			for (let i = 0; i < selfH; i++) {
				for (let j = 0; j < selfW; j++) {
					ctxGenerate.fillStyle = RGBAList[i * selfW + j]
					ctxGenerate.fillRect(j * pxSize, i * pxSize, pxSize, pxSize)
				}
			}

			const imgLocalURL = canvasGenerate.toDataURL('image/png')
			generateFileList.value.push({ url: imgLocalURL, uid: uid })
			loading.close()
		}
	}
</script>

<style lang="less" scoped>
	.userImg {
		display: block;
		width: 100%;
		height: 100%;
	}

	.generateImg {
		:deep(.el-card) {
			// width: 146px;
			// height: 170px;
			display: inline-block;
			margin: 0 5px;

			img {
				width: 117px;
				height: 117px;
				object-fit: contain;
			}

			.generateIcon {
				display: flex;
				justify-content: space-between;
				user-select: none;

				.el-icon {
					color: #000;
					cursor: pointer;
				}
			}
		}
	}

	.dialogImg {
		// max-width: 600px;
		width: 100%;
	}
</style>
