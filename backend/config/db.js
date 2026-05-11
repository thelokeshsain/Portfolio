const mongoose = require('mongoose')
module.exports = async () => {
  try {
    mongoose.set('strictQuery', false)
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: process.env.NODE_ENV === 'production' ? 2 : 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log('✅ MongoDB connected')
  } catch (e) {
    console.error('❌ MongoDB error:', e.message)
    process.exit(1)
  }
}
