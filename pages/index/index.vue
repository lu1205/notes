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
	.content {
		flex: 1;
		padding: 20rpx;
		position: relative;
	}

	.notes-list {
		width: 100%;
	}

	.note-item {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.note-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.note-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		flex: 1;
	}

	.note-time {
		font-size: 24rpx;
		color: #999;
		margin-left: 20rpx;
	}

	.note-content {
		font-size: 28rpx;
		color: #666;
		line-height: 40rpx;
		margin-bottom: 15rpx;
		word-break: break-all;
	}

	.note-footer {
		display: flex;
		justify-content: flex-end;
	}

	.note-delete {
		font-size: 24rpx;
		color: #ff4d4f;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 600rpx;
	}

	.empty-text {
		font-size: 32rpx;
		color: #999;
		margin-bottom: 20rpx;
	}

	.empty-hint {
		font-size: 24rpx;
		color: #ccc;
	}

	.add-btn {
		position: fixed;
		bottom: 40rpx;
		right: 40rpx;
		width: 80rpx;
		height: 80rpx;
		background-color: #007aff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.4);
	}

	.add-btn-text {
		font-size: 48rpx;
		color: #fff;
		line-height: 80rpx;
	}
</style>
