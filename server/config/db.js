import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database using the URI
 * stored in our environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wellfit');
    console.log(`Database connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

export default connectDB;
