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
/* 导入Inter字体 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
	font-family: 'Inter', sans-serif;
	box-sizing: border-box;
}

.content {
	flex: 1;
	background-color: #F0FDFA;
}

.user-section {
	background-color: #0D9488;
	padding: 80rpx 40rpx;
	color: #fff;
	position: relative;
}

.user-avatar {
	width: 140rpx;
	height: 140rpx;
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 36rpx;
	position: relative;
}

.avatar-text {
	font-size: 52rpx;
	font-weight: 600;
}

.user-info {
	position: relative;
}

.user-name {
	font-size: 36rpx;
	font-weight: 600;
	margin-bottom: 12rpx;
}

.user-desc {
	font-size: 26rpx;
	opacity: 0.9;
}

.settings-list {
	background-color: #fff;
	margin: -30rpx 20rpx 20rpx;
	border-radius: 12rpx;
	overflow: hidden;
	border: 1rpx solid #E0F2F1;
	position: relative;
}

.setting-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 36rpx 40rpx;
	border-bottom: 1rpx solid #E0F2F1;
	transition: all 0.2s ease;
	cursor: pointer;
}

.setting-item:hover {
	background-color: #F8FFFE;
}

.setting-item:last-child {
	border-bottom: none;
}

.setting-label {
	font-size: 30rpx;
	color: #134E4A;
	font-weight: 500;
}

.setting-arrow {
	font-size: 24rpx;
	color: #64748B;
	transition: all 0.2s ease;
}

.setting-item:hover .setting-arrow {
	transform: translateX(4rpx);
}

.app-info {
	margin-top: 60rpx;
	text-align: center;
	padding-bottom: 40rpx;
}

.app-version {
	font-size: 24rpx;
	color: #64748B;
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
	padding: 20rpx;
}

.dialog-content {
	background-color: #fff;
	border-radius: 12rpx;
	width: 100%;
	max-width: 500rpx;
	padding: 48rpx;
	border: 1rpx solid #E0F2F1;
	transition: all 0.2s ease;
}

.dialog-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #134E4A;
	text-align: center;
	margin-bottom: 48rpx;
}

.dialog-options {
	margin-bottom: 40rpx;
}

.option-item {
	display: flex;
	align-items: center;
	margin-bottom: 36rpx;
	cursor: pointer;
	transition: all 0.2s ease;
}

.option-item:hover {
	transform: translateX(8rpx);
}

.option-radio {
	width: 36rpx;
	height: 36rpx;
	border: 2rpx solid #E0F2F1;
	border-radius: 50%;
	margin-right: 24rpx;
	position: relative;
	transition: all 0.2s ease;
}

.option-radio.selected {
	background-color: #0D9488;
	border-color: #0D9488;
}

.option-radio.selected::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 16rpx;
	height: 16rpx;
	background-color: #fff;
	border-radius: 50%;
}

.option-label {
	font-size: 30rpx;
	color: #134E4A;
	font-weight: 500;
}

.dialog-buttons {
	display: flex;
	gap: 20rpx;
}

.dialog-btn {
	flex: 1;
	padding: 24rpx;
	text-align: center;
	border-radius: 8rpx;
	transition: all 0.2s ease;
	font-weight: 500;
	cursor: pointer;
}

.cancel-btn {
	background-color: #F8FFFE;
	color: #64748B;
	border: 1rpx solid #E0F2F1;
}

.cancel-btn:hover {
	background-color: #E0F2F1;
}

.confirm-btn {
	background-color: #0D9488;
	color: #fff;
}

.confirm-btn:hover {
	background-color: #0F766E;
}

.btn-text {
	font-size: 30rpx;
}

/* 响应式设计 */
@media screen and (max-width: 375px) {
	.user-section {
		padding: 60rpx 30rpx;
	}

	.user-avatar {
		width: 120rpx;
		height: 120rpx;
		margin-bottom: 30rpx;
	}

	.avatar-text {
		font-size: 48rpx;
	}

	.user-name {
		font-size: 32rpx;
		margin-bottom: 10rpx;
	}

	.user-desc {
		font-size: 24rpx;
	}

	.settings-list {
		margin: -24rpx 16rpx 16rpx;
	}

	.setting-item {
		padding: 30rpx 32rpx;
	}

	.setting-label {
		font-size: 28rpx;
	}

	.setting-arrow {
		font-size: 22rpx;
	}

	.app-info {
		margin-top: 48rpx;
		padding-bottom: 32rpx;
	}

	.app-version {
		font-size: 22rpx;
	}

	.dialog-content {
		padding: 36rpx;
	}

	.dialog-title {
		font-size: 30rpx;
		margin-bottom: 40rpx;
	}

	.option-item {
		margin-bottom: 30rpx;
	}

	.option-radio {
		width: 32rpx;
		height: 32rpx;
		margin-right: 20rpx;
	}

	.option-radio.selected::after {
		width: 14rpx;
		height: 14rpx;
	}

	.option-label {
		font-size: 28rpx;
	}

	.dialog-buttons {
		gap: 16rpx;
	}

	.dialog-btn {
		padding: 20rpx;
	}

	.btn-text {
		font-size: 28rpx;
	}
}

@media screen and (min-width: 768px) {
	.user-section {
		padding: 100rpx 40rpx;
		max-width: 800rpx;
		margin: 0 auto;
	}

	.settings-list {
		max-width: 760rpx;
		margin: -30rpx auto 20rpx;
	}

	.app-info {
		margin-top: 80rpx;
		padding-bottom: 60rpx;
	}

	.dialog-content {
		max-width: 550rpx;
		padding: 56rpx;
	}

	.dialog-title {
		font-size: 36rpx;
		margin-bottom: 56rpx;
	}

	.option-item {
		margin-bottom: 40rpx;
	}

	.option-label {
		font-size: 32rpx;
	}

	.dialog-btn {
		padding: 28rpx;
	}

	.btn-text {
		font-size: 32rpx;
	}
}
</style>