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

			<view class="setting-item" @tap="openExportDialog">
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
				success: function (res) {
					if (res.confirm) {
						console.log('用户点击确定');
					}
				}
			});
		},

		// 显示导出笔记弹窗
		openExportDialog() {
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
			// 生成带时间戳的文件名
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

			if (this.exportType === 'decrypted') {
				// 导出解密版笔记
				NoteStorage.getAllNotes().then(notes => {
					const notesJson = JSON.stringify(notes, null, 2);
					const filename = `notes-decrypted-${timestamp}.json`;
					this.downloadFile(filename, notesJson);
				});
			} else {
				// 导出加密版笔记
				console.log('开始导出加密版笔记');

				// 读取加密的笔记数据
				this.readEncryptedNotes().then(encryptedNotes => {
					console.log('获取加密笔记成功:', typeof encryptedNotes);
					const filename = `notes-encrypted-${timestamp}.json`;
					this.downloadFile(filename, encryptedNotes);
				}).catch(err => {
					console.error('获取加密笔记失败:', err);
					uni.showToast({
						title: '获取加密笔记失败',
						icon: 'none'
					});
				});
			}
		},

		// 读取加密的笔记数据
		readEncryptedNotes() {
			return new Promise((resolve, reject) => {
				if (typeof plus !== 'undefined') {
					// 使用plus.io读取加密的笔记文件
					plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
						fs.root.getFile('notes.txt', { create: true }, (fileEntry) => {
							fileEntry.file((file) => {
								const reader = new plus.io.FileReader();
								reader.onloadend = function (e) {
									const content = e.target.result || '';
									console.log('读取加密笔记文件成功:', content);
									resolve(content);
								};
								reader.onerror = function (e) {
									console.error('读取加密笔记文件失败:', e);
									reject(e);
								};
								reader.readAsText(file, 'utf-8');
							}, (error) => {
								console.error('获取加密笔记文件失败:', error);
								reject(error);
							});
						}, (error) => {
							console.error('获取文件失败:', error);
							reject(error);
						});
					}, (error) => {
						console.error('请求文件系统失败:', error);
						// 降级到本地存储
						try {
							const content = uni.getStorageSync('notes');
							console.log('从本地存储读取加密笔记:', content);
							resolve(content || '');
						} catch (storageError) {
							console.error('从本地存储读取失败:', storageError);
							reject(storageError);
						}
					});
				} else {
					// 在非App环境下，使用本地存储
					try {
						const content = uni.getStorageSync('notes');
						console.log('从本地存储读取加密笔记:', content);
						resolve(content || '');
					} catch (error) {
						console.error('从本地存储读取失败:', error);
						reject(error);
					}
				}
			});
		},

		// 下载文件
		downloadFile(filename, content) {
			// 检查并请求存储权限
			this.checkStoragePermission().then(granted => {
				console.log('存储权限检查结果:', granted);
				if (granted) {
					// 尝试使用不同的方法来实现文件导出
					this.tryExport(filename, content);
				} else {
					uni.showToast({
						title: '需要存储权限才能导出文件',
						icon: 'none'
					});
				}
			});
		},

		// 检查并请求存储权限
		checkStoragePermission() {
			return new Promise((resolve) => {
				if (typeof plus !== 'undefined') {
					// 在App环境中，请求多个存储权限
					plus.android.requestPermissions(['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.MANAGE_EXTERNAL_STORAGE'], function (result) {
						console.log('权限请求结果:', result);
						if (result.granted.length > 0) {
							console.log('权限授予成功:', result.granted);
							resolve(true);
						} else {
							console.log('权限授予失败:', result.denied);
							resolve(false);
						}
					}, function (error) {
						console.error('请求权限失败:', error);
						resolve(false);
					});
				} else {
					// 在非App环境中，直接返回true
					resolve(true);
				}
			});
		},

		// 尝试导出文件
		tryExport(filename, content) {
			// 尝试使用不同的方法来实现文件导出
			try {
				// 方法1: 尝试使用PUBLIC_DOWNLOADS直接写入系统下载目录
				if (typeof plus !== 'undefined' && plus.io) {
					try {
						console.log('开始导出文件:', filename);

						// 直接使用PUBLIC_DOWNLOADS文件系统
						plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, (fs) => {
							console.log('获取PUBLIC_DOWNLOADS文件系统成功:', fs);

							// 在下载目录中创建文件
							fs.root.getFile(filename, { create: true }, (fileEntry) => {
								console.log('获取文件成功:', fileEntry);
								console.log('文件路径:', fileEntry.fullPath);

								// 创建写入器
								fileEntry.createWriter((writer) => {
									console.log('创建写入器成功:', writer);
									const self = this;

									writer.onwriteend = function () {
										console.log('文件写入成功:', fileEntry.fullPath);

										// 显示成功提示
										uni.showToast({
											title: '导出成功',
											icon: 'success'
										});
										uni.showModal({
											title: '导出成功',
											content: `文件已保存到: ${fileEntry.fullPath}`,
											confirmText: '确定'
										});
									};

									writer.onerror = function (e) {
										console.error('文件写入失败:', e);
										// 降级到使用PRIVATE_DOC临时文件
										self.tryDefaultExport(filename, content);
									};

									// 写入文件内容
									writer.write(content);
								}, (error) => {
									console.error('创建写入器失败:', error);
									// 降级到使用PRIVATE_DOC临时文件
									self.tryDefaultExport(filename, content);
								});
							}, (error) => {
								console.error('获取文件失败:', error);
								// 降级到使用PRIVATE_DOC临时文件
								this.tryDefaultExport(filename, content);
							});
						}, (error) => {
							console.error('请求PUBLIC_DOWNLOADS文件系统失败:', error);
							// 降级到使用PRIVATE_DOC临时文件
							this.tryDefaultExport(filename, content);
						});
					} catch (publicError) {
						console.error('PUBLIC_DOWNLOADS写入失败:', publicError);
						// 降级到使用PRIVATE_DOC临时文件
						this.tryDefaultExport(filename, content);
					}
				} else {
					// 降级到方法2
					this.fallbackDownload(filename, content);
				}
			} catch (error) {
				console.error('导出失败:', error);
				// 降级到方法2
				this.fallbackDownload(filename, content);
			}
		},

		// 尝试使用默认的方法导出文件
		tryDefaultExport(filename, content) {
			console.log('尝试使用PRIVATE_DOC临时文件:', filename);
			// 尝试使用PRIVATE_DOC临时文件
			plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
				console.log('获取PRIVATE_DOC文件系统成功:', fs);
				fs.root.getFile(filename, { create: true }, (fileEntry) => {
					console.log('获取文件成功:', fileEntry);
					console.log('文件完整路径:', fileEntry.fullPath);
					fileEntry.createWriter((writer) => {
						console.log('创建写入器成功:', writer);
						const self = this;
						writer.onwriteend = function () {
							console.log('写入文件成功:', fileEntry.fullPath);
							// 降级到方法2，使用Blob下载
							self.fallbackDownload(filename, content);
						};
						writer.onerror = function (e) {
							console.error('写入文件失败:', e);
							// 降级到方法2
							self.fallbackDownload(filename, content);
						};
						writer.write(content);
					}, (error) => {
						console.error('创建文件写入器失败:', error);
						// 降级到方法2
						this.fallbackDownload(filename, content);
					});
				}, (error) => {
					console.error('获取文件失败:', error);
					// 降级到方法2
					this.fallbackDownload(filename, content);
				});
			}, (error) => {
				console.error('请求文件系统失败:', error);
				// 降级到方法2
				this.fallbackDownload(filename, content);
			});
		},

		// 降级下载方法
		fallbackDownload(filename, content) {
			// 使用Blob创建文件
			const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
			const url = URL.createObjectURL(blob);

			// 创建下载链接
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			link.click();

			// 释放URL对象
			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 100);

			uni.showToast({
				title: '导出成功',
				icon: 'success'
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