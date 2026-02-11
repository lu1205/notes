<template>
	<view class="content">
		<view class="settings-title">密码设置</view>
		
		<view class="form-item">
			<text class="form-label">新密码</text>
			<input 
				v-model="passwordForm.newPassword" 
				class="form-input"
				placeholder="请输入新密码"
				password
			/>
		</view>
		
		<view class="form-item">
			<text class="form-label">确认密码</text>
			<input 
				v-model="passwordForm.confirmPassword" 
				class="form-input"
				placeholder="请再次输入密码"
				password
			/>
		</view>
		
		<view class="save-btn" @tap="savePassword">
			<text class="save-btn-text">保存</text>
		</view>
		
		<view class="tip-text">
			<text>设置密码后，每次启动应用都需要输入密码验证</text>
		</view>
	</view>
</template>

<script>
	import NoteStorage from '../../utils/storage.js';
		export default {
			data() {
				return {
					passwordForm: {
						newPassword: '',
						confirmPassword: ''
					}
				}
			},
			methods: {
				// 保存密码
				savePassword() {
					if (!this.passwordForm.newPassword) {
						uni.showToast({
							title: '请输入新密码',
							icon: 'none'
						});
						return;
					}
					
					if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
						uni.showToast({
							title: '两次输入的密码不一致',
							icon: 'none'
						});
						return;
					}
					
					if (this.passwordForm.newPassword.length < 4) {
						uni.showToast({
							title: '密码长度至少4位',
							icon: 'none'
						});
						return;
					}
					
					const success = NoteStorage.setPassword(this.passwordForm.newPassword);
					if (success) {
						// 重新加密所有笔记
						NoteStorage.reencryptNotes();
						
						uni.showToast({
							title: '密码设置成功',
							icon: 'success'
						});
						// 延迟跳转到密码验证页面，让用户看到提示
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/auth/verify'
							});
						}, 1000);
					} else {
						uni.showToast({
							title: '密码设置失败',
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
		padding: 40rpx 30rpx;
		background-color: #F0FDFA;
		font-family: 'Inter', sans-serif;
	}

	.settings-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #134E4A;
		margin-bottom: 60rpx;
		text-align: center;
	}

	.form-item {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 0 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.1);
	}

	.form-label {
		display: block;
		font-size: 28rpx;
		color: #134E4A;
		margin-bottom: 15rpx;
		padding-top: 30rpx;
	}

	.form-input {
		font-size: 28rpx;
		color: #134E4A;
		padding-bottom: 30rpx;
		width: 100%;
		border-bottom: 2rpx solid #E0F2F1;
	}

	.save-btn {
		background-color: #0D9488;
		border-radius: 10rpx;
		padding: 30rpx;
		text-align: center;
		margin-top: 60rpx;
		box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.3);
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

	.tip-text {
		margin-top: 40rpx;
		text-align: center;
	}

	.tip-text text {
		font-size: 24rpx;
		color: #64748B;
		line-height: 36rpx;
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.content {
			padding: 30rpx 20rpx;
		}

		.settings-title {
			font-size: 32rpx;
			margin-bottom: 40rpx;
		}

		.form-item {
			padding: 0 20rpx;
		}

		.save-btn {
			margin-top: 40rpx;
			padding: 25rpx;
		}
	}
</style>