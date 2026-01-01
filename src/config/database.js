const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config()

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URL)
    // console.log(process.env.MONGO_URL)

    console.log(`MongoDB connected`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};


const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error(`MongoDB disconnection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
