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
	.content {
		flex: 1;
		padding: 40rpx 30rpx;
		background-color: #f5f5f5;
	}

	.settings-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 60rpx;
		text-align: center;
	}

	.form-item {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 0 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.form-label {
		display: block;
		font-size: 28rpx;
		color: #666;
		margin-bottom: 15rpx;
		padding-top: 30rpx;
	}

	.form-input {
		font-size: 28rpx;
		color: #333;
		padding-bottom: 30rpx;
		width: 100%;
	}

	.save-btn {
		background-color: #007aff;
		border-radius: 10rpx;
		padding: 30rpx;
		text-align: center;
		margin-top: 60rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
	}

	.save-btn-text {
		font-size: 32rpx;
		color: #fff;
		font-weight: bold;
	}

	.tip-text {
		margin-top: 40rpx;
		text-align: center;
	}

	.tip-text text {
		font-size: 24rpx;
		color: #999;
		line-height: 36rpx;
	}
</style>