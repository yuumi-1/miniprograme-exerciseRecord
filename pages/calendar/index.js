Page({
  data: {
    currentYear: 0,      // 当前显示的年份
    currentMonth: 0,     // 当前显示的月份
    prevMonthDays: [],   // 上月剩余天数占位
    currentMonthDays: [], // 当前月天数
    nextMonthDays: [],   // 下月开始天数占位
    hasRecord: {},       // 记录某天是否有训练数据
    showModal: false,    // 是否显示详情弹窗
    selectedDate: '',    // 选中的日期
    selectedWorkout: {},  // 选中日期的训练数据
    unit: '',
  },

  onLoad() {
    // 初始化当前日期
    const now = new Date();
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1
    });
    
    // 生成日历数据
    this.generateCalendarData();
    
    // 查询训练记录
    this.queryWorkoutRecords();
  },
  
  onShow() {
    const app = getApp();
    // 检查全局刷新标记
    if (app.globalData.needRefreshCalendar) {
      // 重置标记
      app.globalData.needRefreshCalendar = false;
      
      // 执行刷新
      this.refreshData();
    }
  },

  // 生成日历数据
  generateCalendarData() {
    const { currentYear, currentMonth } = this.data;
    
    // 获取当月第一天是星期几（0-6）
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    
    // 获取当月总天数
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // 上月剩余天数
    const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();
    const prevMonthDays = [];
    for (let i = firstDay; i > 0; i--) {
      prevMonthDays.push({ day: prevMonthLastDay - i + 1, date: '' });
    }
    
    // 当月天数
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${currentYear}-${this.formatNumber(currentMonth)}-${this.formatNumber(i)}`;
      currentMonthDays.push({ day: i, date });
    }
    
    // 下月开始天数
    const nextMonthDaysCount = 42 - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays = [];
    for (let i = 1; i <= nextMonthDaysCount; i++) {
      nextMonthDays.push({ day: i, date: '' });
    }
    
    this.setData({
      prevMonthDays,
      currentMonthDays,
      nextMonthDays
    });
  },

  // 格式化数字为两位数
  formatNumber(n) {
    return n < 10 ? '0' + n : n;
  },

  // 查询训练记录
  queryWorkoutRecords() {
    const { currentYear, currentMonth } = this.data;
    const startDate = `${currentYear}-${this.formatNumber(currentMonth)}-01`;
    const endDate = `${currentYear}-${this.formatNumber(currentMonth + 1)}-01`;
    
    wx.showLoading({ title: '加载中' });
    
    // 查询数据库
    wx.cloud.database().collection('workout_records')
      .orderBy('_openid','asc')
      .orderBy('date','asc')
      .where({
        date: wx.cloud.database().command.gte(startDate).lt(endDate)
      })
      .get()
      .then(res => {
        wx.hideLoading();
        
        // 构建有记录的日期映射
        const hasRecord = {};
        res.data.forEach(record => {
          hasRecord[record.date] = true;
        });
        
        this.setData({ hasRecord });
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({ title: '加载失败', icon: 'none' });
        console.error('查询训练记录失败:', err);
      });
  },

  // 上月切换
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth--;
    
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendarData();
      this.queryWorkoutRecords();
    });
  },

  // 下月切换
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth++;
    
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendarData();
      this.queryWorkoutRecords();
    });
  },

  // 日期点击事件
  onDayClick(e) {
    const date = e.currentTarget.dataset.date;
    
    // 如果没有选择有效日期或该日期没有记录，不做处理
    if (!date || !this.data.hasRecord[date]) return;
    
    wx.showLoading({ title: '加载中...' });
    
    // 查询该日期的详细训练记录
    wx.cloud.database().collection('workout_records')
      .orderBy('_openid','asc')
      .orderBy('date','asc')
      .where({ date })
      .get()
      .then(res => {
        wx.hideLoading();
        
        if (res.data.length > 0) {
          console.log("===",res)
          this.setData({
            showModal: true,
            selectedDate: date,
            selectedWorkout: res.data[0],
            unit: res.data[0].unit
          });
        } else {
          wx.showToast({ title: '没有找到记录', icon: 'none' });
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({ title: '加载失败', icon: 'none' });
        console.error('查询详情失败:', err);
      });
  },
  
  onPullDownRefresh() {
    console.log('触发下拉刷新')
    
    // 执行数据刷新
    this.refreshData((err) => {
      // 停止下拉刷新动画
      wx.stopPullDownRefresh()
      
      if (err) {
        console.error('刷新失败:', err)
        wx.showToast({ title: '刷新失败: ' + err.message, icon: 'none' })
        return
      }
      
      wx.showToast({ title: '刷新完成', icon: 'success' })
    })
  },
  
  // 统一刷新方法
  refreshData(callback) {
    // 并行执行以下刷新操作
    Promise.all([
      this.generateCalendarData(),   // 重新生成日历
      this.queryWorkoutRecords()     // 重新查询记录
    ]).then(() => {
      callback?.()
    }).catch(err => {
      console.error('刷新失败:', err)
      wx.showToast({ title: '刷新失败', icon: 'none' })
      callback?.()
    })
  },
  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false });
  },
  
  //编辑数据
  handleEdit(e) {
    const editRecordId = this.data.selectedWorkout._id;
    wx.navigateTo({
      url: `/pages/addRecord/index?isEdit=true&editRecordId=${editRecordId}`
    })
    this.closeModal();
    
  },
  // 训练组点击事件
  onExerciseClick(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      showModal: true,
      selectedWorkout: this.data.records[index]
    });
  },
});