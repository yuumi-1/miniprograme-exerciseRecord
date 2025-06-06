const app = getApp();

Page({
  data: {
    date: new Date().toISOString().split('T')[0], // 默认今天
    weight: '',
    notes: '',
    unitIndex: 0,
    units: ['kg', 'lb'],
    timesOfDay: [],
    selectedTime: 0,
    lastWeight: null,
    weightDelta: 0,
    isSaving: false
  },
  
  onLoad() {
    this.loadLastWeight();
  },
  
  // 加载上次记录的体重
  loadLastWeight() {
    wx.cloud.callFunction({
      name: 'getLastWeightRecord',
      success: res => {
        if (res.result.code === 0 && res.result.data) {
          this.setData({
            lastWeight: res.result.data,
            weightDelta: this.calculateDelta(res.result.data.weight)
          });
        }
      }
    });
  },
  
  // 计算体重变化
  calculateDelta(lastWeight) {
    const current = parseFloat(this.data.weight);
    if (isNaN(current) || !lastWeight) return 0;
    
    // 单位转换为相同单位比较
    const currentInKg = this.data.unitIndex === 0 ? current : current * 0.4536;
    const lastInKg = lastWeight.unit === 'kg' ? lastWeight.weight : lastWeight.weight * 0.4536;
    
    // 返回保留两位小数的差值
    return parseFloat((currentInKg - lastInKg).toFixed(2));
  },
  
  bindDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  
  onWeightInput(e) {
    let value = e.detail.value;
    
    // 限制最多输入三位整数和两位小数
    if (/^\d{0,3}(\.\d{0,2})?$/.test(value) || value === '') {
      this.setData({ weight: value });
    }
    
    // 如果存在上次记录，重新计算差值
    if (this.data.lastWeight) {
      this.setData({
        weightDelta: this.calculateDelta(this.data.lastWeight)
      });
    }
  },
  
  bindUnitChange(e) {
    this.setData({ unitIndex: e.detail.value });
    
    // 如果存在上次记录，重新计算差值
    if (this.data.lastWeight && this.data.weight) {
      this.setData({
        weightDelta: this.calculateDelta(this.data.lastWeight)
      });
    }
  },
  
  selectTime(e) {
    this.setData({ selectedTime: e.currentTarget.dataset.index });
  },
  
  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },
  
  // 保存体重记录
  saveWeightRecord() {
    const { date, weight, unitIndex, units, notes, selectedTime, timesOfDay } = this.data;
    
    if (!weight || isNaN(parseFloat(weight))) {
      wx.showToast({ title: '请输入有效的体重值', icon: 'none' });
      return;
    }
    
    this.setData({ isSaving: true });
    
    wx.cloud.callFunction({
      name: 'saveWeightRecord',
      data: {
        weight: parseFloat(weight),
        unit: units[unitIndex],
        date: date,
        timeOfDay: timesOfDay[selectedTime],
        notes: notes,
        createdAt: new Date().toISOString()
      },
      success: res => {
        this.setData({ isSaving: false });
        if (res.result.code === 0) {
          wx.showToast({ title: '体重记录已保存', icon: 'success' });
          
          // 返回上一页并刷新数据
          this.navigateBackWithRefresh();
        } else {
          wx.showToast({ title: res.result.message, icon: 'none' });
        }
      },
      fail: err => {
        this.setData({ isSaving: false });
        console.error('保存体重记录失败:', err);
        wx.showToast({ title: '保存失败，请重试', icon: 'none' });
      }
    });
  },
  
  // 返回上一页并刷新数据
  navigateBackWithRefresh() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2];
      
      // 如果上一页是历史记录页，刷新数据
      if (prevPage.refreshData) {
        prevPage.refreshData();
      }
      
      // 如果上一页是主页，刷新最近体重
      if (prevPage.updateLatestWeight) {
        prevPage.updateLatestWeight();
      }
    }
    
    setTimeout(() => {
      wx.navigateBack({ delta: 1 });
    }, 1500);
  },
  
  onBack() {
    wx.navigateBack();
  }
});