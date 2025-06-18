// cloudfunctions/getWeightData/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 从weight集合中获取数据，按日期降序排列
    const res = await db.collection('weight_records')
      .orderBy('date', 'desc')
      .get()
      
    return {
      success: true,
      data: res.data
    }
  } catch (e) {
    console.error('获取体重数据失败', e)
    return {
      success: false,
      error: e
    }
  }
}