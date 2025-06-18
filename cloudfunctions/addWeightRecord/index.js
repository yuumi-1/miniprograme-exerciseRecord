// cloudfunctions/saveWeightRecord/index.js
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event) => {
  const weight = event.weight
  const date = event.date
  const db = cloud.database()
  
  try {
      const weightRecord = {
      weight,           // 体重数值
      date, // 测量日期
      createdAt: new Date(), // 记录创建时间
      serverTime: db.serverDate() // 云数据库记录时间
    }
    
    // 3. 保存到体重记录集合
    db.collection('weight_records')
      .where({ date: weightRecord.date })
      .get()
      .then(res => {
        if (res.data.length > 0) {
          db.collection('weight_records')
            .doc(res.data[0]._id)
            .update({
              data: {
                weight: weightRecord.weight
              }
            })
        } else {
          // 无当日记录：新建记录
          db.collection('weight_records').add({
            data: weightRecord
          })
        }
      });
    return {
      success: true,
      message: '体重记录保存成功',
      data: {
        date: date,
        weight
      }
    }
  } catch (err) {
    console.error('保存体重记录失败:', err)
    return {
      success: false,
      message: '保存体重记录失败',
      error: err.message
    }
  }
}