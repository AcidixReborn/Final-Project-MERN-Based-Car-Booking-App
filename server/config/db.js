// Mongoose ODM for MongoDB database operations
const mongoose = require('mongoose');

// Async function to establish MongoDB connection
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ no longer requires these options, but included for clarity
    });

    // Log successful connection with host information
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Event listener for connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    // Event listener for when the connection is lost
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Handle graceful shutdown when the application is terminated (Ctrl+C)
    process.on('SIGINT', async () => {
      // Close the MongoDB connection before exiting
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    // Log connection error and exit the process with failure code
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Export the connectDB function for use in server.js
module.exports = connectDB;
