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
			methods: {
				// 保存新笔记
				saveNote() {
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
					
					const success = NoteStorage.saveNote(noteData);
					if (success) {
						uni.showToast({
							title: '创建成功',
							icon: 'success'
						});
						// 延迟返回，让用户看到提示
						setTimeout(() => {
							uni.navigateBack();
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
	/* 导入设计系统样式 */
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

	.content {
		flex: 1;
		padding: 20rpx;
		position: relative;
		background-color: #F0FDFA;
		font-family: 'Inter', sans-serif;
	}

	.note-title-input {
		font-size: 32rpx;
		font-weight: 600;
		color: #134E4A;
		padding: 10rpx 0;
		margin-bottom: 20rpx;
		border-bottom: 1rpx solid #E0F2F1;
		width: 100%;
	}

	.note-content-input {
		font-size: 28rpx;
		color: #134E4A;
		line-height: 40rpx;
		min-height: 400rpx;
		padding: 10rpx 0;
		width: 100%;
	}

	.save-btn {
		margin-top: 40rpx;
		background-color: #0D9488;
		border-radius: 10rpx;
		padding: 20rpx;
		text-align: center;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.save-btn:hover {
		background-color: #14B8A6;
	}

	.save-btn-text {
		font-size: 32rpx;
		color: #fff;
		font-weight: 600;
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.content {
			padding: 15rpx;
		}

		.note-title-input {
			font-size: 28rpx;
		}

		.note-content-input {
			font-size: 24rpx;
			line-height: 36rpx;
		}

		.save-btn {
			margin-top: 30rpx;
			padding: 15rpx;
		}

		.save-btn-text {
			font-size: 28rpx;
		}
	}
</style>