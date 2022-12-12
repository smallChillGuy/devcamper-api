const express = require('express')
const dotenv = require('dotenv')

// Route files
const bootcamps = require('./routes/bootcamps')

// Load env 
dotenv.config({ path: './config/config.env' })

const app = express()

// Mount routers
app.use('/api/v1/bootcamps', bootcamps)


const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV

let msgListen = `Server running in ${NODE_ENV} mode on port: ${PORT}`
app.listen(PORT, console.log(msgListen))

