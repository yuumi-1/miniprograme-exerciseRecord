// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const id = event.id
  const db = cloud.database()
  
  try {
    db.collection('weight_records')
      .doc(id)
      .remove()
    return {
      success: true,
      message: '已删除',
    }
  } catch (err) {
    console.error('删除失败:', err)
    return {
      success: false,
      message: '删除失败',
      error: err.message
    }
  }
}