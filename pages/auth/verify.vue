<template>
	<view class="content">
		<view class="app-logo">
			<text class="logo-text">笔记App</text>
		</view>
		
		<view class="verify-form">
			<view class="form-title">请输入密码</view>
			
			<input 
				v-model="password" 
				class="password-input"
				placeholder="密码"
				password
				@confirm="verifyPassword"
			/>
			
			<view class="verify-btn" @tap="verifyPassword">
				<text class="verify-btn-text">验证</text>
			</view>
			
			<view class="change-password-btn" @tap="goToChangePassword">
				<text class="change-password-text">修改密码</text>
			</view>
			
			<view class="error-text" v-if="errorMessage">
				<text>{{errorMessage}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import NoteStorage from '../../utils/storage.js';
		export default {
			data() {
				return {
					password: '',
					errorMessage: ''
				}
			},
			onLoad() {
				// 检查是否设置了密码
				const hasPassword = NoteStorage.hasPassword();
				if (!hasPassword) {
					// 没有设置密码，跳转到设置密码页面
					uni.reLaunch({
						url: '/pages/settings/password'
					});
				}
			},
			methods: {
				// 验证密码
				verifyPassword() {
					if (!this.password) {
						this.errorMessage = '请输入密码';
						return;
					}
					
					const isValid = NoteStorage.verifyPassword(this.password);
					if (isValid) {
						// 密码验证成功，跳转到首页
						uni.reLaunch({
							url: '/pages/home/index'
						});
					} else {
						this.errorMessage = '密码错误，请重新输入';
						this.password = '';
					}
				},
				
				// 跳转到修改密码页面
				goToChangePassword() {
					uni.navigateTo({
						url: '/pages/settings/change-password'
					});
				}
			}
	}
</script>

<style>
	/* 导入设计系统样式 */
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

	.content {
		flex: 1;
		background-color: #F0FDFA;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-family: 'Inter', sans-serif;
	}

	.app-logo {
		margin-bottom: 80rpx;
	}

	.logo-text {
		font-size: 48rpx;
		font-weight: bold;
		color: #0D9488;
	}

	.verify-form {
		width: 80%;
		max-width: 400px;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 60rpx 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.1);
	}

	.form-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #134E4A;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.password-input {
		font-size: 28rpx;
		color: #134E4A;
		padding: 25rpx 0;
		border-bottom: 2rpx solid #E0F2F1;
		margin-bottom: 40rpx;
		text-align: center;
		width: 100%;
	}

	.verify-btn {
		background-color: #0D9488;
		border-radius: 10rpx;
		padding: 25rpx;
		text-align: center;
		margin-bottom: 20rpx;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.verify-btn:hover {
		background-color: #14B8A6;
	}

	.verify-btn-text {
		font-size: 32rpx;
		color: #fff;
		font-weight: 600;
	}

	.error-text {
		text-align: center;
	}

	.error-text text {
			font-size: 24rpx;
			color: #ef4444;
		}
		
		.change-password-btn {
			margin-top: 30rpx;
			text-align: center;
			cursor: pointer;
		}
		
		.change-password-text {
			font-size: 28rpx;
			color: #0D9488;
			transition: color 0.2s ease;
		}

		.change-password-text:hover {
			color: #14B8A6;
		}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.verify-form {
			width: 90%;
			padding: 40rpx 30rpx;
		}

		.logo-text {
			font-size: 40rpx;
		}

		.form-title {
			font-size: 28rpx;
		}
	}
</style>