<template>
	<view class="content">
		<view v-if="note" class="note-detail">
			<!-- 标题输入 -->
			<input 
				v-model="editForm.title" 
				class="note-title-input"
				placeholder="请输入标题"
			/>
			
			<!-- 内容输入 -->
			<textarea 
				v-model="editForm.content" 
				class="note-content-input"
				placeholder="请输入内容"
				auto-height
			/>
			
			<!-- 保存按钮 -->
			<view class="save-btn" @tap="saveNote">
				<text class="save-btn-text">保存</text>
			</view>
		</view>
		
		<!-- 加载中 -->
		<view v-else class="loading-state">
			<text class="loading-text">加载中...</text>
		</view>
	</view>
</template>

<script>
	import NoteStorage from '../../utils/storage.js';
		export default {
			data() {
				return {
					note: null,
					editForm: {
						title: '',
						content: ''
					}
				}
			},
			onLoad(options) {
				if (options.id) {
					this.loadNote(options.id);
				}
			},
			methods: {
				// 加载笔记详情
				async loadNote(id) {
					const note = await NoteStorage.getNote(id);
					if (note) {
						this.note = note;
						this.editForm = {
							title: note.title,
							content: note.content
						};
					} else {
						uni.showToast({
							title: '笔记不存在',
							icon: 'none'
						});
						// 延迟返回，让用户看到提示
						setTimeout(() => {
							uni.navigateBack();
						}, 1000);
					}
				},
				
				// 保存笔记
				async saveNote() {
					if (!this.editForm.title && !this.editForm.content) {
						uni.showToast({
							title: '标题和内容不能为空',
							icon: 'none'
						});
						return;
					}
					
					const noteData = {
						id: this.note.id,
						title: this.editForm.title || '无标题',
						content: this.editForm.content || ''
					};
					
					const success = await NoteStorage.saveNote(noteData);
					if (success) {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						});
						// 延迟返回，让用户看到提示
						setTimeout(() => {
							uni.navigateBack();
						}, 1000);
					} else {
						uni.showToast({
							title: '保存失败',
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

	.note-detail {
		width: 100%;
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

	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 400rpx;
	}

	.loading-text {
		font-size: 28rpx;
		color: #64748B;
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