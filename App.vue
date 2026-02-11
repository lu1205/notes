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
		background-color: #f5f5f5;
	}
</style>
