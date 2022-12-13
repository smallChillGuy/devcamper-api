const mongoose = require('mongoose')

const connectDB = async () => {
  mongoose.set('strictQuery', true)
  const URI = process.env.MONGO_URI
  const conn = await mongoose.connect(URI)
  console.log(`MongoDB Connected: ${conn.connection.host}`.white.bgGreen)
}

module.exports = connectDB
