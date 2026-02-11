<template>
	<view class="content">
		<view class="settings-title">修改密码</view>
		
		<view class="form-item">
			<text class="form-label">原密码</text>
			<input 
				v-model="changePasswordForm.oldPassword" 
				class="form-input"
				placeholder="原密码"
				password
			/>
		</view>
		
		<view class="form-item">
			<text class="form-label">新密码</text>
			<input 
				v-model="changePasswordForm.newPassword" 
				class="form-input"
				placeholder="新密码"
				password
			/>
		</view>
		
		<view class="form-item">
			<text class="form-label">确认新密码</text>
			<input 
				v-model="changePasswordForm.confirmPassword" 
				class="form-input"
				placeholder="确认新密码"
				password
			/>
		</view>
		
		<view class="save-btn" @tap="changePassword">
			<text class="save-btn-text">保存</text>
		</view>
		
		<view class="error-text" v-if="errorMessage">
			<text>{{errorMessage}}</text>
		</view>
	</view>
</template>

<script>
	import NoteStorage from '../../utils/storage.js';
		export default {
			data() {
				return {
					changePasswordForm: {
						oldPassword: '',
						newPassword: '',
						confirmPassword: ''
					},
					errorMessage: ''
				}
			},
			methods: {
				// 修改密码
				async changePassword() {
					// 验证原密码
					const isOldPasswordValid = NoteStorage.verifyPassword(this.changePasswordForm.oldPassword);
					if (!isOldPasswordValid) {
						this.errorMessage = '原密码错误';
						return;
					}
					
					// 验证新密码
					if (!this.changePasswordForm.newPassword) {
						this.errorMessage = '请输入新密码';
						return;
					}
					
					if (this.changePasswordForm.newPassword.length < 4) {
						this.errorMessage = '密码长度至少4位';
						return;
					}
					
					if (this.changePasswordForm.newPassword !== this.changePasswordForm.confirmPassword) {
						this.errorMessage = '两次输入的密码不一致';
						return;
					}
					
					// 先使用原密码获取所有笔记（确保能解密旧数据）
					const notes = await NoteStorage.getAllNotes();
					
					// 修改密码
					const success = NoteStorage.setPassword(this.changePasswordForm.newPassword);
					if (success) {
						// 使用新密码加密笔记数据
						await NoteStorage.encryptNotes(notes);
						
						uni.showToast({
							title: '密码修改成功',
							icon: 'success'
						});
						// 延迟返回，让用户看到提示
						setTimeout(() => {
							uni.navigateBack();
						}, 1000);
					} else {
						this.errorMessage = '密码修改失败';
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

	.error-text {
		margin-top: 30rpx;
		text-align: center;
	}

	.error-text text {
		font-size: 24rpx;
		color: #ff4d4f;
	}
</style>