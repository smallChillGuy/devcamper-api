const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Connect to the database
connectDB()

const app = express()

// Body parser
app.use(express.json())

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Route files
const bootcamps = require('./routes/bootcamps')

// Mount routers
app.use('/api/v1/bootcamps', bootcamps)


app.use(errorHandler)


const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV

let msgListen = `Server running in ${NODE_ENV} mode on port: ${PORT}`
const server = app.listen(PORT, console.log(msgListen.white.bgCyan))

process.on('unhandledRejection', (err, promise) => {
  console.log(`${err}`.red)
  server.close(() => process.exit(1))
})

