// pages/Profile/Profile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    max1RM: [],        // 最大 1RM 值
    maxExercise: [],  // 对应名称
    loading: true,    // 加载状态
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    const app = getApp();
    this.setData({
      menuHeight: app.globalData.menuHeight,
      menuBottom: app.globalData.menuBottom,
      menuRight: app.globalData.menuRight,
      menuTop: app.globalData.menuTop
    });
    this.calculateMax1RM();
  },
  //计算最大1RM
  calculateMax1RM() {
    const db = wx.cloud.database();
    this.setData({ loading: true });

    // 查询所有训练记录
    db.collection('workout_records')
    .where({
      _openid: wx.getStorageSync('openid') || wx.getStorageSync('userInfo').openid
    })
    .get()
    .then(res => {
      const records = res.data;
      if (!records.length) {
        this.setData({ loading: false, max1RM: [], maxExercise: '暂无记录' });
        return;
      }
      // 计算每条记录的 1RM 并找出最大值
      let max1RM = [];
      let maxExercise = [];
      // 遍历所有记录
      records.forEach(record => {
      // 遍历每个训练项目
        record.exercises.forEach(exercise => {
          // 遍历每个练习的所有组
          exercise.sets.forEach(set => {
            // 确保组数据包含重量和次数
            const weight = parseFloat(set.weight);
            const reps = parseFloat(set.reps);
            
            // 使用 Epley 公式计算 1RM
            const epley1RM = Math.round(weight * (1 + reps / 30) * 100) / 100 ;            
            max1RM.push(epley1RM);
            maxExercise.push(exercise.name)
          });
        });
      });
    this.setData({
      max1RM,
      maxExercise,
      loading: false
    })
    .catch(err => {
      console.error('获取记录失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    });
    })
  },
  
  // 返回上一页
  onNavigateBack: function() {
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})