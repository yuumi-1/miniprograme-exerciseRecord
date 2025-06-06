Page({
  data: {
    records: [], // 训练记录列表
    unit: '',
    loading: false, // 加载状态
    hasMore: true, // 是否还有更多数据
    pageSize: 25, // 每页条数
    pageNum: 1, // 当前页码
    showModal: false,
    selectedWorkout: {}  // 选中日期的训练数据
  },

  onLoad: function() {
    this.getRecords();
    
  },

  // 获取训练记录
  getRecords: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    // 使用云开发数据库查询
    const db = wx.cloud.database();
    db.collection('workout_records')
      .orderBy('date', 'desc')
      .skip((this.data.pageNum - 1) * this.data.pageSize)
      .limit(this.data.pageSize)
      .get()
      .then(res => {
        const newRecords = res.data;
        const hasMore = newRecords.length === this.data.pageSize;
                
        this.setData({
          records: this.data.pageNum === 1 ? newRecords : [...this.data.records, ...newRecords],
          unit: this.data.pageNum === 1 && newRecords.length > 0 ? newRecords[0].unit : this.data.unit,
          pageNum: this.data.pageNum + 1,
          hasMore: hasMore,
          loading: false
        });
      })
      .catch(err => {
        console.error('获取记录失败:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
  },

  // 格式化时间
  formatTime: function(timestamp) {
    if (!timestamp) return '';
    
    // 处理云开发返回的服务器时间格式
    if (typeof timestamp === 'object' && timestamp.constructor.name === 'Object') {
      timestamp = timestamp.$date;
    }
    
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },
  // 跳转到数据分析页面
  navigateToCalendar: function() {
    wx.navigateTo({
      url: '/pages/calendar/index'
    });
  },
  // 跳转到添加记录页面
  navigateToAddRecord: function() {
    wx.navigateTo({
      url: '/pages/addRecord/index'
    });
  },
  // 跳转到我的页面
  navigateToProfile: function() {
    wx.navigateTo({
      url: '/pages/Profile/index'
    });
  },
  // 添加刷新方法（修改：重置分页状态）
  refreshData() {
    this.setData({
      pageNum: 1,
      hasMore: true
    });
    return this.getRecords();
  },

   // 删除记录
  deleteRecord(e) {
    const recordId = e.currentTarget.dataset.id; 

    // 显示确认对话框
    wx.showModal({
      title: "确认删除",
      content: "确定要删除这条训练记录吗？",
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          
          // 调用云函数删除数据
          wx.cloud.database().collection('workout_records').doc(recordId).remove()
            .then(res => {
              wx.hideLoading();
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              // 刷新数据列表
              const app = getApp();
              app.globalData.needRefreshCalendar = true;  
              this.refreshData();   

            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
              console.error('删除失败：', err);
            });
          }
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
    });
  },
  
  // 上拉加载更多
  onReachBottom: function() {
    this.getRecords();
  },
  // 训练组点击事件
  onExerciseClick(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      showModal: true,
      selectedWorkout: this.data.records[index]
    });
  },
  //编辑数据
  handleEdit(e) {
    const editRecordId = this.data.selectedWorkout._id;
    wx.navigateTo({
      url: `/pages/addRecord/index?isEdit=true&editRecordId=${editRecordId}`
    })
    this.closeModal();
    
  },
  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false });
  },
  
});    
