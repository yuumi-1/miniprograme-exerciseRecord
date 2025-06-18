Page({
  data: {
    date: '',
    value: [],
    units: ['kg', 'lb'],
    unitIndex: 0,
    isEdit: false,
    editRecordId: {},
    globalSettings: null,
    exercises: [],
    current:[],
    keyboardHeight: 0,
    visible: false,
    exerciseOptions: [
      {
        label: "基础训练",
        value: "basic",
        children: [
          { label: "深蹲", value: "squat" },
          { label: "卧推", value: "benchpress" },
          { label: "硬拉", value: "deadlift" }
        ]
      },
      {
        label: "上肢推类",
        value: "upperPush",
        children: [
          { label: "上斜卧推", value: "inclineDumbbellPress" },
          { label: "下斜卧推", value: "declineBarbellBench" },
          { label: "双杠臂屈伸", value: "dip" },
          { label: "过头推举", value: "overheadPress" }
        ]
      },
      {
        label: "上肢拉类",
        value: "upperPull",
        children: [
          { label: "引体向上", value: "pullup" },
          { label: "高位下拉", value: "latPulldown" },
          { label: "划船", value: "dumbbellRow" },
          { label: "俯身哑铃飞鸟", value: "bentOverDumbbellFly" }
        ]
      },
      {
        label: "下肢训练",
        value: "lowerBody",
        children: [
          { label: "罗马尼亚硬拉", value: "romanianDeadlift" },
          { label: "前蹲", value: "legCurl" },
          { label: "器械倒蹬", value: "lunge" },
          { label: "腿弯举", value: "bulgarianSplitSquat" }
        ]
      },
      {
        label: "肩部训练",
        value: "shoulder",
        children: [
          { label: "哑铃侧平举", value: "lateralRaise" },
          { label: "哑铃前平举", value: "frontRaise" },
          { label: "哑铃后束飞鸟", value: "rearDeltFly" },
          { label: "阿诺德推举", value: "arnoldPress" }
        ]
      }
    ]
  },
  onShow() {
    const app = getApp();
    this.setData({ globalSettings: app.globalData.userSettings });
  },
  onLoad(options) {
    const app = getApp();
    const exerciseOptionsLabelValueMap = this.generateLabelValueMap(this.data.exerciseOptions)
    this.setData({ globalSettings: app.globalData.userSettings,
      exerciseOptionsLabelValueMap });
    // 初始化默认训练项
    const defaultExercises = app.globalData.userSettings.defaultExercises.map(name => ({
      name: name,
      sets: [{ weight: '', reps: '', showAddBtn: true }],
      // 新增标志项用于判断是否为默认项
      isDefaultExercise: true,
      isPinned: true // 默认都是固定显示的
    }));
    if (options.isEdit) {
      wx.cloud.database().collection('workout_records')
      .orderBy('_openid','asc')
      .where({
        _id: options.editRecordId
      })
      .get()
      .then(res => {
        const exercises = [];
        res.data[0].exercises.forEach(exercise => {
          const lastIndex = exercise.sets.length - 1
          if (lastIndex > -1) {
            exercise.sets?.forEach(sets => {sets.showAddBtn = false})
            exercise.sets[lastIndex].showAddBtn = true
            if(app.globalData.userSettings.defaultExercises.includes(exercise.name)){exercise.isPinned = true}
            exercises.push(exercise)
          }
        });
        this.setData({
          isEdit: true ,
          editRecordId: res.data[0],
          exercises: exercises,
          date: res.data[0].date,
        });
      });
    } else {
      // 初始化日期为今天
      const date = new Date();
      this.setData({
        date: `${date.getFullYear()}-${this.formatNumber(date.getMonth() + 1)}-${this.formatNumber(date.getDate())}`,
        exercises: defaultExercises, // 使用全局配置的默认项
      });
    }
    this.data.exercises.forEach(item => {
      const selectedOptionValue = this.data.exerciseOptionsLabelValueMap[item.name]
      // this.data.current.push(selectedOptionValue.value)
      this.setData({
        current: [...this.data.current, selectedOptionValue]
      });      
    })
    this.setData({
      current: [0,[...this.data.current]]
    });    
    //键盘监听    
    this.keyboardListener = wx.onKeyboardHeightChange(res => {
      setTimeout(() => {
          this.setData({
            keyboardHeight: res.height
          });
        }, 200); // 延时2秒
    });
  },
  // 页面卸载时取消监听
  onUnload() {
    this.keyboardListener && this.keyboardListener();
  },
  // 显示训练项选择器
  showExercisePicker(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      showExercisePicker: true,
      currentExerciseIndex: index
    });
  },

  // 隐藏训练项选择器
  hideExercisePicker() {
    this.setData({ showExercisePicker: false });
  },

  // 选择训练项
  selectExercise(e) {
    const optionIndex = e.currentTarget.dataset.index;
    const { presetExercises, currentExerciseIndex, exercises } = this.data;
    
    if (currentExerciseIndex >= 0 && optionIndex >= 0) {
      // 更新训练项名称
      exercises[currentExerciseIndex].name = presetExercises[optionIndex];
      
      this.setData({
        exercises,
        showExercisePicker: false
      });
      
      wx.showToast({ title: '已更新训练项', icon: 'success' });
    }
  },
  // 格式化数字为两位数
  formatNumber(n) {
    return n < 10 ? '0' + n : n;
  },

  // 日期选择变更
  bindDateChange(e) {
    this.setData({ date: e.detail.value });
  },

  // 单位选择变更
  bindUnitChange(e) {
    this.setData({ unitIndex: e.detail.value });
  },

  // 重量变更
  onWeightChange(e) {
    const { type, index } = e.currentTarget.dataset;
    const exercises = [...this.data.exercises];
    const exerciseIndex = exercises.findIndex(item => item.name === type);
    
    exercises[exerciseIndex].sets[index].weight = e.detail.value;
    this.updateShowAddBtn(exercises, exerciseIndex);
    this.setData({ exercises });
  
  },

  // 次数变更
  onRepsChange(e) {
    const { type, index } = e.currentTarget.dataset;
    const exercises = [...this.data.exercises];
    const exerciseIndex = exercises.findIndex(item => item.name === type);
    
    exercises[exerciseIndex].sets[index].reps = e.detail.value;
    this.updateShowAddBtn(exercises, exerciseIndex);
    this.setData({ exercises });
  
  },

  // 更新显示添加按钮的逻辑
  updateShowAddBtn(exercises, exerciseIndex) {
    const sets = exercises[exerciseIndex].sets;
    sets.forEach((set, i) => {
      set.showAddBtn = (i === sets.length - 1);
    });
  },

  // 添加组
  addSet(e) {
    const type = e.currentTarget.dataset.type;
    const exercises = [...this.data.exercises];
    const exerciseIndex = exercises.findIndex(item => item.name === type);
    const sets = exercises[exerciseIndex].sets;
    exercises[exerciseIndex].sets.push({ weight: sets[sets.length-1].weight, reps: sets[sets.length-1].reps, showAddBtn: true });
    
    // 更新其他组的showAddBtn状态
    this.updateShowAddBtn(exercises, exerciseIndex);
    this.setData({ exercises });
  },

  // 删除组
  deleteSet(e) {
    const { type, index } = e.currentTarget.dataset;
    const exercises = [...this.data.exercises];
    const exerciseIndex = exercises.findIndex(item => item.name === type);
    
    if (exerciseIndex !== -1 && exercises[exerciseIndex].sets.length > 1) {
      exercises[exerciseIndex].sets.splice(index, 1);
      // 更新其他组的showAddBtn状态
      this.updateShowAddBtn(exercises, exerciseIndex);
      this.setData({ exercises });
    }
  },
  deleteItem(e) {
    // 获取训练项索引
    const { index } = e.currentTarget.dataset;
    const exercises = [...this.data.exercises];
    
    // 删除训练项
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${exercises[index].name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从数组中移除该项
          exercises.splice(index, 1);
          this.setData({ exercises });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },
  // 处理训练项选择
  onExerciseSelect(e) {
    const { index } = e.currentTarget.dataset;
    const value = e.detail.value;
    const selectedOption = this.data.exerciseOptions.options.find(
      option => option.value === value
    );
    const exercises = [...this.data.exercises];
    exercises[index].name = selectedOption.label;
    
    this.setData({ exercises });
  },

  // 自定义训练项名称输入
  onCustomNameChange(e) {
    const { index } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    const exercises = [...this.data.exercises];
    exercises[index].name = value;
    
    this.setData({ exercises });
    
  },

  // 修改：添加自定义训练组的方法
  addCustomSet() {
    const app = getApp();
    const exercises = [...this.data.exercises];
    
    // 查找最后一个自定义训练项的索引
    let lastCustomIndex = -1;
    exercises.forEach((item, index) => {
      if (!item.isDefaultExercise) lastCustomIndex = index;
    });
    
    // 生成唯一的默认名称
    const defaultName = lastCustomIndex === -1 ? 
      '自定义训练' : `自定义训练${exercises.filter(item => !item.isDefaultExercise).length + 1}`;
    
    // 添加新的自定义训练项
    exercises.push({
      // name: defaultName,
      sets: [{ weight: '', reps: '', showAddBtn: true }],
      isCustom: true,
      isPinned: false, // 默认不固定
      isDefaultExercise: false // 标记为非默认项
    });
    // 更新数据
    this.setData({ exercises });
  },

  saveAndBack() {
    // 数据验证
    if (!this.validateData()) {
      return;
    }
  
    // 准备数据
    const workoutData = {
      date: this.data.date,
      unit: this.data.units[this.data.unitIndex],
      exercises: this.data.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets.filter(set => set.reps)
      })),
      createTime: new Date()
    };
    console.log("保存的数据：",workoutData)
    wx.showLoading({ title: '保存中...' });
  
    if (this.data.isEdit) {
      const originalRecord = this.data.editRecordId;
      const isDateChanged = this.data.date !== originalRecord.date;
      
      if (!isDateChanged) {
        // 日期未修改：直接更新原记录
        wx.cloud.database().collection('workout_records')
          .doc(originalRecord._id)
          .update({
            data: {
              unit: workoutData.unit,
              exercises: workoutData.exercises,
              updateTime: new Date()
            }
          })
          .then(() => this.handleSaveSuccess())
          .catch(err => this.handleSaveError(err));
      } else {
        // 日期修改：处理新旧日期记录合并
        this.handleDateChangedSave(originalRecord, workoutData);
      }
    } else {
      // 非编辑模式：查询当日记录
      wx.cloud.database().collection('workout_records')
        .where({ date: this.data.date })
        .get()
        .then(res => {
          if (res.data.length > 0) {
            // 已有当日记录：执行合并
            const existingRecord = res.data[0];
            const mergedData = this.mergeWorkoutRecords(existingRecord, workoutData);
            
            wx.cloud.database().collection('workout_records')
              .doc(existingRecord._id)
              .update({
                data: {
                  unit: mergedData.unit,
                  exercises: mergedData.exercises,
                  updateTime: new Date()
                }
              })
              .then(() => this.handleSaveSuccess())
              .catch(err => this.handleSaveError(err));
          } else {
            // 无当日记录：新建记录
            wx.cloud.database().collection('workout_records').add({
              data: workoutData
            })
            .then(() => this.handleSaveSuccess())
            .catch(err => this.handleSaveError(err));
          }
        });
    }
  },
  
  // 处理编辑模式下日期变更的情况
  handleDateChangedSave(originalRecord, newRecord) {
    // 查询新日期是否有记录
    wx.cloud.database().collection('workout_records')
      .where({ date: newRecord.date })
      .get()
      .then(res => {
        // 新日期存在记录：合并旧记录到新记录
        if (res.data.length > 0) {
          const existingRecord = res.data[0];
          const mergedData = this.mergeWorkoutRecords(existingRecord, newRecord);
          
          // 更新新日期的记录
          return wx.cloud.database().collection('workout_records')
            .doc(existingRecord._id)
            .update({
              data: {
                unit: mergedData.unit,
                exercises: mergedData.exercises,
                updateTime: new Date()
              }
            })
            .then(() => {
              // 删除原日期记录
              return wx.cloud.database().collection('workout_records')
                .doc(originalRecord._id)
                .remove();
            });
        } else {
          // 新日期无记录：直接修改原记录日期
          return wx.cloud.database().collection('workout_records')
            .doc(originalRecord._id)
            .update({
              data: {
                date: newRecord.date,
                unit: newRecord.unit,
                exercises: newRecord.exercises,
                updateTime: new Date()
              }
            });
        }
      })
      .then(() => this.handleSaveSuccess())
      .catch(err => this.handleSaveError(err));
  },
  
  // 改进的合并逻辑
  mergeWorkoutRecords(existingRecord, newRecord) {
    // 如果记录在不同日期，直接返回新记录（避免跨日期合并）
    if (existingRecord.date !== newRecord.date) {
      return newRecord;
    }
    
    const mergedRecord = { ...existingRecord };
    
    // 合并单位（新记录优先）
    if (existingRecord.unit !== newRecord.unit) {
      mergedRecord.unit = newRecord.unit;
    }
    
    // 训练项合并
    const mergedExercises = [];
    
    // 1. 处理原记录中的训练项
    existingRecord.exercises.forEach(existingExercise => {
      const matchedExercise = newRecord.exercises.find(
        newEx => newEx.name === existingExercise.name
      );
      
      if (matchedExercise) {
        // 合并同名训练项
        mergedExercises.push({
          name: existingExercise.name,
          sets: [...existingExercise.sets, ...matchedExercise.sets]
        });
      } else {
        // 保留旧记录独有的训练项
        mergedExercises.push(existingExercise);
      }
    });
    
    // 2. 添加新记录特有的训练项
    newRecord.exercises.forEach(newExercise => {
      const exists = existingRecord.exercises.some(
        ex => ex.name === newExercise.name
      );
      
      if (!exists) {
        mergedExercises.push(newExercise);
      }
    });
    
    mergedRecord.exercises = mergedExercises;
    return mergedRecord;
  },
  
  // 处理保存成功
  handleSaveSuccess() {
    wx.hideLoading();
    wx.showToast({ title: '保存成功', icon: 'success' });
    
    // 刷新前一页的数据
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    const app = getApp();
    app.globalData.needRefreshCalendar = true;
    prevPage.refreshData();
   
    // 返回上一页
    setTimeout(() => wx.navigateBack(), 500);
  },
  
  // 处理保存失败
  handleSaveError(err) {
    wx.hideLoading();
    wx.showToast({ title: '保存失败', icon: 'none' });
    console.error('保存失败:', err);
  },
  togglePinStatus(e) {
    const index = e.currentTarget.dataset.index;
    const app = getApp();
    const { exercises } = this.data;
    const exercise = exercises[index];
    
    // 切换固定状态
    exercise.isPinned = !exercise.isPinned;
    
    // 如果用户取消固定默认项，从全局设置中移除
    if (!exercise.isPinned) {
      const idx = app.globalData.userSettings.defaultExercises.indexOf(exercise.name);
      if (idx !== -1) {
        app.globalData.userSettings.defaultExercises.splice(idx, 1);
      }
    }
    // 如果用户固定自定义项，添加到全局设置
    else if (exercise.isPinned) {
      if (!app.globalData.userSettings.defaultExercises.includes(exercise.name)) {
        app.globalData.userSettings.defaultExercises.push(exercise.name);
      }
    }
    
    // 保存设置到缓存
    app.saveUserSettings();
    
    this.setData({ exercises });
    wx.showToast({
      title: exercise.isPinned ? '已添加固定展示项' : '已取消固定展示项',
      icon: 'none'
    });
  },
  validateData() {
    const exercises = [...this.data.exercises];
    const hasSetsData = this.data.exercises.some(exercise => 
      exercise.sets.some(set => set.reps)
    );
    //weight为空则置0
    exercises.forEach(exercise=>{
      exercise.sets.forEach(set=>{
        if (set.weight === "" && set.reps) {
          set.weight = 0;
        }
      })
    })
    this.setData({ 
      exercises,
    });    
    if (!hasSetsData) {
      wx.showToast({ title: '请至少填写一组锻炼数据', icon: 'none' });
      return false;
    };    
    return true;
  },
  handlePopup(e) {
    this.setData({ visible: true });
  },
  onVisibleChange(e) {
    this.setData({
      visible: e.detail.visible,
    });
  },
  handleGroupChange(event) {
    this.setData({
      current: event.detail.value,      
    });
  },
  
  onClose(){
    this.setData({ visible: false });
  },
  saveExercisesOption(){
    const exercises = [...this.data.exercises];
    this.setData({ 
      exercises,
    });
    //添加新项目
    const currentExercises = this.data.current[1].map(value => {
      const selectedOptionLabel = this.data.exerciseOptionsLabelValueMap[value]
      const matchedItem  = this.data.exercises.find(item => 
        item.name === selectedOptionLabel
      )      
      console.log(matchedItem)
      return matchedItem ? { ...matchedItem } : {
        name: selectedOptionLabel,
        sets: [{ weight: '', reps: '', showAddBtn: true }],
        isPinned: false, // 默认不固定
        isDefaultExercise: false // 标记为非默认项
      }
    })
    this.setData({ 
      exercises:currentExercises,
    });
    this.onClose();
  },
  saveCustomExercises(){
    const exercises = [...this.data.exercises];
    //如果取消勾选，则删除取消勾选的元素
    // exercises.forEach(item => {
    //   const selectedOption = this.data.exerciseOptions.options.find(
    //     option => option.label === item.name
    //   );
    //   if(!this.data.current.includes(selectedOption.value)){
    //     for (let i = exercises.length - 1; i >= 0; i--) {
    //       if (selectedOption.label === exercises[i].name) {
    //         exercises.splice(i, 1);
    //       }
    //     }
    //   }
    // })
    //添加新项目
    this.data.current.forEach(item => {
      const selectedOption = this.data.exerciseOptions.options.find(
        option => option.value === item
      );
      const filteredList  = this.data.exercises.find(item => 
        item.name === selectedOption.label
      )      
      if(!filteredList){
        exercises.push({
          name: selectedOption.label,
          sets: [{ weight: '', reps: '', showAddBtn: true }],
          isPinned: false, // 默认不固定
          isDefaultExercise: false // 标记为非默认项
        })
      }
    })
    this.setData({ 
      exercises,
    });
    this.onClose()
  },
  generateLabelValueMap(tree) {
    const map = {};
    tree.forEach(node=>{
      node.children.forEach(item=>{
        map[item.label] = item.value;
        map[item.value] = item.label;
      })
    })
    return map;
  },
});