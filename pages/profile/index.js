// setting/index.js
Page({
  data: {
    confirmBtn: { content: '关闭', variant: 'base' },
    dialogKey: '',
    showTextAndTitle: false,

  },

  navigateToPage(e) {
    const url = e.currentTarget.dataset.url;
    
    // 执行页面跳转
    if (url) {
      wx.navigateTo({
        url,
        fail(err) {
          console.error('跳转失败:', err)
          wx.showToast({ title: '功能暂未开放', icon: 'none' })
        }
      })
    }
  },

  wx_login() {
    var myThis = this;
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            url: 'https://你服务器的请求地址',
            data: {
              code: res.code
            },
            success(res) {
              myThis.setData({
                openid: res.data.openid
              })
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  showDialog(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ [key]: true, dialogKey: key });
  },
  closeDialog() {
    const { dialogKey } = this.data;
    this.setData({ [dialogKey]: false });
  },

})