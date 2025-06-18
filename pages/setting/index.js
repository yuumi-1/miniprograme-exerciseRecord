const chineseNumber = '一二三四五六七八九十'.split('');

const generateTree = function (deep = 0, count = 10, prefix) {
  const ans = [];

  for (let i = 0; i < count; i += 1) {
    const value = prefix ? `${prefix}-${i}` : `${i}`;
    const rect = {
      label: `选项${chineseNumber[i]}`,
      value,
    };

    if (deep > 0) {
      rect.children = generateTree(deep - 1, 10, value);
    }
    ans.push(rect);
  }

  return ans;
};

Component({
  data: {
    options: generateTree(1),
    value: [],
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

  methods: {
    onChange(e) {
      this.setData({
        value: e.detail.value,
      });
    },
  },
});
