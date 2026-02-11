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

	.error-text {
		margin-top: 30rpx;
		text-align: center;
	}

	.error-text text {
		font-size: 24rpx;
		color: #ef4444;
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