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
	.content {
		flex: 1;
		padding: 20rpx;
		position: relative;
	}

	.note-title-input {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		padding: 10rpx 0;
		margin-bottom: 20rpx;
		border-bottom: 1rpx solid #eee;
	}

	.note-content-input {
		font-size: 28rpx;
		color: #666;
		line-height: 40rpx;
		min-height: 400rpx;
		padding: 10rpx 0;
	}

	.save-btn {
		margin-top: 40rpx;
		background-color: #007aff;
		border-radius: 10rpx;
		padding: 20rpx;
		text-align: center;
	}

	.save-btn-text {
		font-size: 32rpx;
		color: #fff;
	}
</style>