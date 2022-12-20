const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to the database
connectDB();

const app = express();

// Body parser
app.use(express.json());

app.use(cookieParser());


// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
};

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/auth/users', users);
app.use('/api/v1/reviews', reviews);


app.use(errorHandler);


const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV;

let msgListen = `Server running in ${NODE_ENV} mode on port: ${PORT}`;
const server = app.listen(PORT, console.log(msgListen.white.bgCyan));

process.on('unhandledRejection', (err, promise) => {
  console.log(`${err}`.red);
  server.close(() => process.exit(1));
});

