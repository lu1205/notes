<template>
	<view class="content">
		<!-- 笔记列表 -->
		<view v-if="notes.length > 0" class="notes-list">
			<view 
				v-for="note in notes" 
				:key="note.id" 
				class="note-item"
				@tap="goToDetail(note.id)"
			>
				<view class="note-header">
					<text class="note-title">{{note.title}}</text>
					<text class="note-time">{{formatTime(note.updatedAt)}}</text>
				</view>
				<text class="note-content">{{getSummary(note.content)}}</text>
				<view class="note-footer">
					<text class="note-delete" @tap.stop="deleteNote(note.id)">删除</text>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view v-else class="empty-state">
			<text class="empty-text">暂无笔记</text>
			<text class="empty-hint">点击右下角按钮创建新笔记</text>
		</view>
		
		<!-- 新建笔记按钮 -->
		<view class="add-btn" @tap="goToCreate">
			<text class="add-btn-text">+</text>
		</view>
	</view>
</template>

<script>
	import NoteStorage from '../../utils/storage.js';
		export default {
			data() {
				return {
					notes: []
				}
			},
			onLoad() {
				this.loadNotes();
			},
			onShow() {
				this.loadNotes();
			},
			onPullDownRefresh() {
				this.loadNotes();
				uni.stopPullDownRefresh();
			},
			methods: {
				// 加载笔记列表
				loadNotes() {
					this.notes = NoteStorage.getAllNotes();
				},
				
				// 导航栏右侧按钮点击事件
				onNavigationBarButtonTap() {
					uni.navigateTo({
						url: '/pages/settings/password'
					});
				},
				
				// 格式化时间
				formatTime(timestamp) {
					const date = new Date(timestamp);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					const hours = String(date.getHours()).padStart(2, '0');
					const minutes = String(date.getMinutes()).padStart(2, '0');
					return `${year}-${month}-${day} ${hours}:${minutes}`;
				},
				
				// 获取内容摘要
				getSummary(content) {
					if (!content) return '无内容';
					const summary = content.replace(/\\n/g, ' ').substring(0, 50);
					return summary.length < content.length ? summary + '...' : summary;
				},
				
				// 跳转到详情页
				goToDetail(id) {
					uni.navigateTo({
						url: `/pages/note/detail?id=${id}`
					});
				},
				
				// 跳转到新建页面
				goToCreate() {
					uni.navigateTo({
						url: '/pages/note/create'
					});
				},
				
				// 删除笔记
				deleteNote(id) {
					uni.showModal({
						title: '确认删除',
						content: '确定要删除这篇笔记吗？',
						confirmText: '删除',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								const success = NoteStorage.deleteNote(id);
								if (success) {
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									});
									this.loadNotes();
								} else {
									uni.showToast({
										title: '删除失败',
										icon: 'none'
									});
								}
							}
						}
					});
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
		padding: 20rpx;
		position: relative;
		background-color: #F0FDFA;
	}

	.notes-list {
		width: 100%;
	}

	.note-item {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		border: 1rpx solid #E0F2F1;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.note-item:hover {
		border-color: #0D9488;
		background-color: #F8FFFE;
	}

	.note-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16rpx;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.note-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #134E4A;
		flex: 1;
		min-width: 0;
		line-height: 48rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.note-time {
		font-size: 22rpx;
		color: #64748B;
		white-space: nowrap;
		align-self: flex-start;
	}

	.note-content {
		font-size: 28rpx;
		color: #334155;
		line-height: 44rpx;
		margin-bottom: 20rpx;
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
	}

	.note-footer {
		display: flex;
		justify-content: flex-end;
		padding-top: 16rpx;
		border-top: 1rpx solid #E0F2F1;
	}

	.note-delete {
		font-size: 24rpx;
		color: #F97316;
		padding: 8rpx 16rpx;
		border-radius: 6rpx;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.note-delete:hover {
		background-color: rgba(249, 115, 22, 0.1);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 600rpx;
		padding: 0 40rpx;
	}

	.empty-text {
		font-size: 36rpx;
		color: #64748B;
		margin-bottom: 24rpx;
		font-weight: 500;
		text-align: center;
	}

	.empty-hint {
		font-size: 26rpx;
		color: #94A3B8;
		text-align: center;
		line-height: 36rpx;
	}

	.add-btn {
		position: fixed;
		bottom: 40rpx;
		right: 40rpx;
		width: 90rpx;
		height: 90rpx;
		background-color: #0D9488;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		z-index: 999;
		cursor: pointer;
	}

	.add-btn:hover {
		background-color: #0F766E;
		transform: scale(1.05);
	}

	.add-btn-text {
		font-size: 52rpx;
		color: #fff;
		line-height: 90rpx;
		font-weight: 300;
	}

	/* 响应式设计 */
	@media screen and (max-width: 375px) {
		.content {
			padding: 16rpx;
		}

		.note-item {
			padding: 20rpx;
			margin-bottom: 16rpx;
		}

		.note-title {
			font-size: 30rpx;
			line-height: 42rpx;
		}

		.note-content {
			font-size: 26rpx;
			line-height: 40rpx;
			margin-bottom: 16rpx;
		}

		.note-time {
			font-size: 20rpx;
		}

		.empty-text {
			font-size: 32rpx;
			margin-bottom: 20rpx;
		}

		.empty-hint {
			font-size: 24rpx;
			line-height: 32rpx;
		}

		.add-btn {
			width: 80rpx;
			height: 80rpx;
			bottom: 32rpx;
			right: 32rpx;
		}

		.add-btn-text {
			font-size: 48rpx;
			line-height: 80rpx;
		}
	}

	@media screen and (min-width: 768px) {
		.content {
			padding: 30rpx;
			max-width: 800rpx;
			margin: 0 auto;
		}

		.note-item {
			padding: 30rpx;
			margin-bottom: 24rpx;
		}

		.note-title {
			font-size: 36rpx;
			line-height: 52rpx;
		}

		.note-content {
			font-size: 30rpx;
			line-height: 48rpx;
			margin-bottom: 24rpx;
		}

		.add-btn {
			width: 100rpx;
			height: 100rpx;
			bottom: 48rpx;
			right: 48rpx;
		}

		.add-btn-text {
			font-size: 56rpx;
			line-height: 100rpx;
		}
	}
</style>
