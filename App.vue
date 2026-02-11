<script>
	export default {
		onLaunch: function() {
			console.log('App Launch');
		},
		onShow: function() {
			console.log('App Show');
			// 检查是否需要重新验证密码
			this.checkSessionTimeout();
		},
		onHide: function() {
			console.log('App Hide');
			// 记录应用进入后台的时间
			uni.setStorageSync('app_background_time', Date.now());
		},
		methods: {
			// 检查会话超时
			checkSessionTimeout() {
				const backgroundTime = uni.getStorageSync('app_background_time');
				const currentTime = Date.now();
				const timeDiff = (currentTime - backgroundTime) / 1000 / 60; // 转换为分钟
				
				// 如果在后台超过5分钟，需要重新验证密码
				if (backgroundTime && timeDiff > 5) {
					uni.reLaunch({
						url: '/pages/auth/verify'
					});
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	page {
		background-color: #F0FDFA;
		font-family: 'Inter', sans-serif;
	}

	/* TabBar 美化 */
	.uni-tabbar {
		background-color: #fff !important;
		border-top: 1rpx solid #E0F2F1 !important;
		box-shadow: 0 -2rpx 12rpx rgba(13, 148, 136, 0.1) !important;
		height: 56px !important;
	}

	.uni-tabbar .uni-tabbar__item {
		font-size: 14px !important;
		color: #64748B !important;
	}

	.uni-tabbar .uni-tabbar__item.uni-tabbar__item--active {
		color: #0D9488 !important;
	}

	/* 中间加号按钮特殊样式 */
	.uni-tabbar .uni-tabbar__item:nth-child(2) {
		position: relative;
	}

	.uni-tabbar .uni-tabbar__item:nth-child(2) .uni-tabbar__icon {
		background-color: #0D9488 !important;
		border-radius: 50% !important;
		width: 48px !important;
		height: 48px !important;
		line-height: 48px !important;
		text-align: center !important;
		color: #fff !important;
		font-size: 24px !important;
		font-weight: bold !important;
		margin-top: -12px !important;
		box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.3) !important;
		transition: all 0.2s ease !important;
	}

	.uni-tabbar .uni-tabbar__item:nth-child(2) .uni-tabbar__icon:hover {
		transform: scale(1.05) !important;
		background-color: #14B8A6 !important;
	}

	/* 移除中间按钮的文字 */
	.uni-tabbar .uni-tabbar__item:nth-child(2) .uni-tabbar__label {
		display: none !important;
	}
</style>
