<template>
	<view class="content">
		<view class="user-section">
			<view class="user-avatar">
				<text class="avatar-text">我的</text>
			</view>
			<view class="user-info">
				<text class="user-name">笔记用户</text>
				<text class="user-desc">使用密码保护您的笔记</text>
			</view>
		</view>
		
		<view class="settings-list">
			<view class="setting-item" @tap="goToChangePassword">
				<text class="setting-label">修改密码</text>
				<text class="setting-arrow">></text>
			</view>
			
			<view class="setting-item" @tap="showExportDialog">
				<text class="setting-label">导出笔记</text>
				<text class="setting-arrow">></text>
			</view>
			
			<view class="setting-item" @tap="aboutApp">
				<text class="setting-label">关于应用</text>
				<text class="setting-arrow">></text>
			</view>
		</view>
		
		<view class="app-info">
			<text class="app-version">版本 1.0.0</text>
		</view>
		
		<!-- 导出笔记弹窗 -->
		<view class="dialog-mask" v-if="showExportDialog">
			<view class="dialog-content">
				<view class="dialog-title">导出笔记</view>
				
				<view class="dialog-options">
					<view class="option-item" @tap="selectExportType('decrypted')">
						<view class="option-radio" :class="{ 'selected': exportType === 'decrypted' }"></view>
						<text class="option-label">解密版</text>
					</view>
					
					<view class="option-item" @tap="selectExportType('encrypted')">
						<view class="option-radio" :class="{ 'selected': exportType === 'encrypted' }"></view>
						<text class="option-label">加密版</text>
					</view>
				</view>
				
				<view class="dialog-buttons">
					<view class="dialog-btn cancel-btn" @tap="cancelExport">
						<text class="btn-text">取消</text>
					</view>
					<view class="dialog-btn confirm-btn" @tap="exportNotes">
						<text class="btn-text">导出</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import NoteStorage from '../../utils/storage.js';
		export default {
			data() {
				return {
					showExportDialog: false,
					exportType: 'decrypted' // 'encrypted' 或 'decrypted'
				}
			},
			methods: {
				// 跳转到修改密码
				goToChangePassword() {
				uni.navigateTo({
					url: '/pages/settings/change-password'
				});
			},
			
			// 关于应用
			aboutApp() {
				uni.showModal({
					title: '关于应用',
					content: '笔记App v1.0.0\n\n一个安全的本地笔记应用，支持密码保护和数据加密。',
				confirmText: '确定',
				success: function(res) {
				if (res.confirm) {
					console.log('用户点击确定');
				}
			});
			},
			
			// 显示导出笔记弹窗
			showExportDialog() {
				this.showExportDialog = true;
			},
			
			// 选择导出类型
			selectExportType(type) {
				this.exportType = type;
			},
			
			// 取消导出
			cancelExport() {
				this.showExportDialog = false;
			},
			
			// 导出笔记
			exportNotes() {
				if (this.exportType === 'decrypted') {
					// 导出解密版笔记
					NoteStorage.getAllNotes().then(notes => {
						const notesJson = JSON.stringify(notes, null, 2);
						this.downloadFile('notes-decrypted.json', notesJson);
					});
				} else {
					// 导出加密版笔记
					uni.getStorage({ 
						key: 'notes',
						success: (res) => {
							this.downloadFile('notes-encrypted.json', res.data);
						}
					});
				}
			},
			
			// 下载文件
			downloadFile(filename, content) {
				uni.downloadFile({
					url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
					filePath: `${uni.env.USER_DATA_PATH}/${filename}`,
					success: (res) => {
						uni.showToast({
							title: '导出成功',
							icon: 'success'
						});
					},
					fail: (err) => {
						uni.showToast({
							title: '导出失败',
							icon: 'none'
						});
					}
				});
			}
		}
	}
</script>

<style>
	.content {
		flex: 1;
		background-color: #f5f5f5;
	}

	.user-section {
		background-color: #007aff;
		padding: 60rpx 40rpx;
		color: #fff;
	}

	.user-avatar {
		width: 120rpx;
		height: 120rpx;
		background-color: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 30rpx;
	}

	.avatar-text {
		font-size: 48rpx;
		font-weight: bold;
	}

	.user-name {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.user-desc {
		font-size: 24rpx;
		opacity: 0.8;
	}

	.settings-list {
		background-color: #fff;
		margin-top: 20rpx;
		border-radius: 10rpx;
		overflow: hidden;
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 40rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.setting-item:last-child {
		border-bottom: none;
	}

	.setting-label {
		font-size: 28rpx;
		color: #333;
	}

	.setting-arrow {
		font-size: 28rpx;
		color: #999;
	}

	.app-info {
		margin-top: 60rpx;
		text-align: center;
	}

	.app-version {
			font-size: 24rpx;
			color: #999;
		}
		
		/* 导出笔记弹窗样式 */
		.dialog-mask {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.5);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 999;
		}
		
		.dialog-content {
			background-color: #fff;
			border-radius: 20rpx;
			width: 80%;
			padding: 40rpx;
		}
		
		.dialog-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			text-align: center;
			margin-bottom: 40rpx;
		}
		
		.dialog-options {
			margin-bottom: 30rpx;
		}
		
		.option-item {
			display: flex;
			align-items: center;
			margin-bottom: 30rpx;
		}
		
		.option-radio {
			width: 32rpx;
			height: 32rpx;
			border: 2rpx solid #ddd;
			border-radius: 50%;
			margin-right: 20rpx;
		}
		
		.option-radio.selected {
			background-color: #007aff;
			border-color: #007aff;
		}
		
		.option-label {
			font-size: 28rpx;
			color: #333;
		}
		
		.dialog-buttons {
			display: flex;
			margin-bottom: 20rpx;
		}
		
		.dialog-btn {
			flex: 1;
			padding: 20rpx;
			text-align: center;
			border-radius: 10rpx;
			margin: 0 10rpx;
		}
		
		.cancel-btn {
			background-color: #f5f5f5;
		}
		
		.confirm-btn {
			background-color: #007aff;
		}
		
		.btn-text {
			font-size: 28rpx;
			font-weight: bold;
		}
		
		.cancel-btn .btn-text {
			color: #666;
		}
		
		.confirm-btn .btn-text {
			color: #fff;
		}
</style>