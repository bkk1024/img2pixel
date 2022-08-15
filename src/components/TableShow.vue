<template>
	<el-row :gutter="10">
		<el-col>
			<el-card class="userImg">
				<el-table :data="fileList" stripe style="width: 100%">
					<el-table-column type="index" width="100" align="center" />
					<el-table-column label="用户选择图片">
						<template #default="scope">
							<el-upload action="#" :class="{ disabled: scope.row.fileinfo.length }" v-model:file-list="scope.row.fileinfo" list-type="picture-card" :auto-upload="false" :limit="1" :on-preview="handlePictureCardPreview">
								<el-icon><Plus /></el-icon>
								<template #file="{ file }">
									<div class="showUserImg">
										<img class="el-upload-list__item-thumbnail" :src="file.myLocalUrl" alt="" />
										<span class="el-upload-list__item-actions">
											<span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
												<el-icon><zoom-in /></el-icon>
											</span>
										</span>
									</div>
								</template>
							</el-upload>
							<!-- canvas画布 -->
							<div class="canvas" hidden>
								<canvas :ref="canvasMyList"></canvas>
								<canvas :ref="canvasGenerateList"></canvas>
								<canvas :ref="canvasUserList"></canvas>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="处理后的图片">
						<template #default="scope">
							<div class="generateImg" v-if="scope.row.fileinfo.length" @mouseenter="generateImgMouseEnter(scope)" @mouseleave="generateImgMouseLeave(scope)">
								<img v-if="scope.row.fileinfo.length" :src="scope.row.fileinfo[0].localUrl" alt="" />
								<Transition>
									<div class="iconMask" v-if="scope.row.fileinfo[0].showGenerateIcon">
										<el-icon color="#fff" :size="20" @click="previewGenerateImg(scope.row.fileinfo[0].localUrl)"><ZoomIn /></el-icon>
										<a :href="scope.row.fileinfo[0].url" :download="scope.row.fileinfo[0].uid">
											<el-icon color="#fff" :size="20"><Download /></el-icon>
										</a>
									</div>
								</Transition>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作">
						<template #default="scope">
							<el-button type="danger" icon="Delete" circle @click="deleteImg(scope.row.fileinfo[0].uid)" />
						</template>
					</el-table-column>
				</el-table>
				<div class="addNewColumn">
					<el-button type="success" round :disabled="isAddAbled" @click="addNewColumn">新添加一行</el-button>
				</div>
			</el-card>
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
	import { cloneDeep } from 'lodash'

	defineOptions({
		name: 'table-show',
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
	let oldFileList = []
	const isAddAbled = ref(false)
	// const uploadInit = ref(true)
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

	const canvasUser = ref([])
	const canvasUserList = (el) => {
		if (!canvasUser.value.includes(el)) {
			canvasUser.value.push(el)
		}
	}

	watch(
		() => fileList.value,
		(newValue, oldValue) => {
			if (newValue.length > oldFileList.length && fileList.value.length) {
				// 用户新添加了一个图片
				console.log('用户新添加了一个图片')
				nextTick(() => {
					const ctxMy = canvasMy.value[canvasMy.value.length - 1].getContext('2d')
					const ctxGenerate = canvasGenerate.value[canvasGenerate.value.length - 1].getContext('2d')
					const ctxUser = canvasUser.value[canvasUser.value.length - 1].getContext('2d')

					const uid = newValue[newValue.length - 1].uid

					GenerateImg(canvasMy.value[canvasMy.value.length - 1], ctxMy, canvasGenerate.value[canvasGenerate.value.length - 1], ctxGenerate, canvasUser.value[canvasUser.value.length - 1], ctxUser, uid)
				})
			}
		},
		{ deep: true }
	)

	const dialogImageUrl = ref('')
	const dialogVisible = ref(false)

	const handlePictureCardPreview = (uploadFile) => {
		dialogImageUrl.value = uploadFile.myLocalUrl
		dialogVisible.value = true
	}

	const GenerateImg = (canvasMy, ctxMy, canvasGenerate, ctxGenerate, canvasUser, ctxUser, uid) => {
		const myImg = new Image()
		myImg.setAttribute('crossOrigin', 'Anonymous')
		if (!fileList.value[fileList.value.length - 1].fileinfo.length) {
			return false
		}
		const loading = ElLoading.service({
			lock: true,
			text: 'Loading',
		})
		myImg.src = fileList.value[fileList.value.length - 1].fileinfo[0].url
		// console.log('myImg.src', myImg.src)

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
			// 给 canvasUser 设置宽高
			canvasUser.width = realW
			canvasUser.height = realH
			// 将用户上传的这张图片绘制到 canvasMy 中，以便获取图片颜色信息
			ctxMy.drawImage(myImg, 0, 0, selfW, selfH)
			ctxUser.drawImage(myImg, 0, 0, realW, realH)

			/* 将用户选中的图片转换为本地链接 start */
			const myImgLocalURL = canvasUser.toDataURL('image/png')
			fileList.value[fileList.value.length - 1].fileinfo[0].myLocalUrl = myImgLocalURL
			/* 将用户选中的图片转换为本地链接 end */

			// 获取 canvasMy 中的图片信息
			const imgMyData = ctxMy.getImageData(0, 0, selfW, selfH)
			// console.log('imgMyData', imgMyData)
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
			// generateFileList.value.push({ url: imgLocalURL, uid: uid })
			fileList.value[fileList.value.length - 1].fileinfo[0].localUrl = imgLocalURL
			fileList.value[fileList.value.length - 1].fileinfo[0].showGenerateIcon = false
			oldFileList = cloneDeep(fileList.value)
			loading.close()
			isAddAbled.value = false
		}
	}

	const deleteImg = (uid) => {
		oldFileList = cloneDeep(fileList.value)
		fileList.value = fileList.value.filter((item) => {
			if (item.fileinfo[0].uid != uid) {
				return item
			}
		})
		// console.log('oldFileList', oldFileList)
		// fileList.value[fileList.value.length - 1] = oldFileList[oldFileList.length - 1]
		// console.log('fileList.value', fileList.value)
	}

	const generateImgMouseEnter = (data) => {
		fileList.value[data.$index].fileinfo[0].showGenerateIcon = true
	}
	const generateImgMouseLeave = (data) => {
		fileList.value[data.$index].fileinfo[0].showGenerateIcon = false
	}

	const previewGenerateImg = (url) => {
		dialogImageUrl.value = url
		dialogVisible.value = true
	}

	const addNewColumn = () => {
		oldFileList = cloneDeep(fileList.value)
		isAddAbled.value = true
		const staticFile = {
			fileinfo: [],
		}
		fileList.value.push(staticFile)
	}
</script>

<style lang="less" scoped>
	.addNewColumn {
		margin-top: 20px;
	}

	.disabled {
		:deep(.el-upload--picture-card) {
			display: none;
		}

		.showUserImg {
			width: 100%;
			height: 100%;
		}
	}

	.generateImg {
		position: relative;
		height: 146px;
		width: 146px;
		border: 1px solid #dcdfe6;
		border-radius: 5px;
		overflow: hidden;
		background-color: #fff;

		img {
			position: absolute;
			width: 100%;
			height: 100%;
			object-fit: contain;
		}

		.iconMask {
			display: flex;
			align-items: center;
			justify-content: space-evenly;
			position: absolute;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.5);

			:deep(.el-icon) {
				cursor: pointer;
			}
		}
	}

	.dialogImg {
		// max-width: 600px;
		width: 100%;
	}

	.v-enter-active,
	.v-leave-active {
		opacity: 1;
		transition: opacity 0.2s linear;
	}

	.v-enter-from,
	.v-leave-to {
		opacity: 0;
	}
</style>
