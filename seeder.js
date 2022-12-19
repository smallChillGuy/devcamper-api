const fs = require('fs');
const mongoose = require('mongoose');
const color = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const Bootcamp = require('./models/Bootcamps');
const Course = require('./models/Course');

// Connect to DB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI);

// Read JSON files 
const readJSONfiles = (file) => JSON.parse(fs.readFileSync(`${__dirname}/_data/${file}.json`, 'utf-8'));

// Import into DB
const ImportData = async () => {
  try {
    await Bootcamp.create(readJSONfiles('bootcamps'));
    await Course.create(readJSONfiles('courses'));
    console.log('Data Imported...'.green.bgWhite);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
}

const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    console.log('Data Destroyed...'.red.bgWhite);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
}

if (process.argv[2] === '-i') {
  ImportData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
