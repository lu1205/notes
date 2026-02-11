<template>
	<view class="content">
		<!-- 标题输入 -->
		<input 
			v-model="noteForm.title" 
			class="note-title-input"
			placeholder="请输入标题"
		/>
		
		<!-- 内容输入 -->
		<textarea 
			v-model="noteForm.content" 
			class="note-content-input"
			placeholder="请输入内容"
			auto-height
		/>
		
		<!-- 保存按钮 -->
		<view class="save-btn" @tap="saveNote">
			<text class="save-btn-text">保存</text>
		</view>
	</view>
</template>

<script>
	import NoteStorage from '../../utils/storage.js';
		export default {
			data() {
				return {
					noteForm: {
						title: '',
						content: ''
					}
				}
			},
			onLoad() {
				// 清空表单，确保每次进入页面都是空白的
				this.noteForm = {
					title: '',
					content: ''
				};
			},
			methods: {
				// 保存新笔记
				async saveNote() {
					if (!this.noteForm.title && !this.noteForm.content) {
						uni.showToast({
							title: '标题和内容不能为空',
							icon: 'none'
						});
						return;
					}
					
					const noteData = {
						title: this.noteForm.title || '无标题',
						content: this.noteForm.content || ''
					};
					
					const success = await NoteStorage.saveNote(noteData);
					if (success) {
						uni.showToast({
							title: '创建成功',
							icon: 'success'
						});
						// 延迟跳转到笔记列表页，让用户看到提示
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/home/index'
							});
						}, 1000);
					} else {
						uni.showToast({
							title: '创建失败',
							icon: 'none'
						});
					}
				}
			}
		}
</script>

<style>
	/* 导入Inter字体 */
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

	* {
		font-family: 'Inter', sans-serif;
		box-sizing: border-box;
	}

	.content {
		flex: 1;
		padding: 30rpx;
		position: relative;
		background-color: #F0FDFA;
	}

	.note-title-input {
		font-size: 36rpx;
		font-weight: 600;
		color: #134E4A;
		padding: 20rpx 0;
		margin-bottom: 24rpx;
		border-bottom: 2rpx solid #E0F2F1;
		background-color: transparent;
		transition: border-color 0.2s ease;
		width: 100%;
	}

	.note-title-input:focus {
		border-color: #0D9488;
	}

	.note-title-input::placeholder {
		color: #94A3B8;
		font-weight: normal;
	}

	.note-content-input {
		font-size: 28rpx;
		color: #334155;
		line-height: 48rpx;
		min-height: 500rpx;
		padding: 20rpx 0;
		background-color: transparent;
		border: none;
		width: 100%;
		resize: none;
	}

	.note-content-input::placeholder {
		color: #94A3B8;
	}

	.save-btn {
		margin-top: 40rpx;
		background-color: #0D9488;
		border-radius: 12rpx;
		padding: 24rpx;
		text-align: center;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.save-btn:hover {
		background-color: #0F766E;
	}

	.save-btn-text {
		font-size: 32rpx;
		color: #fff;
		font-weight: 500;
	}

	/* 响应式设计 */
	@media screen and (max-width: 375px) {
		.content {
			padding: 20rpx;
		}

		.note-title-input {
			font-size: 32rpx;
			padding: 16rpx 0;
			margin-bottom: 20rpx;
		}

		.note-content-input {
			font-size: 26rpx;
			line-height: 44rpx;
			min-height: 400rpx;
			padding: 16rpx 0;
		}

		.save-btn {
			margin-top: 32rpx;
			padding: 20rpx;
		}

		.save-btn-text {
			font-size: 30rpx;
		}
	}

	@media screen and (min-width: 768px) {
		.content {
			padding: 40rpx;
			max-width: 800rpx;
			margin: 0 auto;
		}

		.note-title-input {
			font-size: 38rpx;
			padding: 24rpx 0;
			margin-bottom: 30rpx;
		}

		.note-content-input {
			font-size: 30rpx;
			line-height: 52rpx;
			min-height: 600rpx;
			padding: 24rpx 0;
		}

		.save-btn {
			margin-top: 48rpx;
			padding: 28rpx;
		}

		.save-btn-text {
			font-size: 34rpx;
		}
	}
</style>