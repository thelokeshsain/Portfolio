const mongoose = require('mongoose')
module.exports = async () => {
  try {
    mongoose.set('strictQuery', false)
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    console.log('✅ MongoDB connected')
  } catch (e) {
    console.error('❌ MongoDB error:', e.message)
    process.exit(1)
  }
}
