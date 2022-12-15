const fs = require('fs');
const mongoose = require('mongoose');
const color = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const Bootcamp = require('./models/Bootcamps');

// Connect to DB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI);

// Read JSON files 
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

// Import into DB
const ImportData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log('Data Imported...'.green.bgWhite);
    process.exit();
  } catch (err) {
    console.log(err);
  }
}

const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log('Data Destroyed...'.red.bgWhite);
    process.exit();
  } catch (err) {
    console.log(err);
  }
}

const showData = async () => {
  try {
    const bootcamps = await Bootcamp.find();
    console.log(bootcamps);
    console.log("All Data has been showed".cyan.bgWhite);
    process.exit();
  } catch (err) {
    console.log(err);
  } 
}

if (process.argv[2] === '-i') {
  ImportData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else if (process.argv[2] === '-s') {
  showData();
}

