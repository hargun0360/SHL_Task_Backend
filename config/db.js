const mongoose = require('mongoose');

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(`mongodb+srv://hargun0360:ramdas0360%40@cluster0.rn1lwsn.mongodb.net/shl`, {
        useNewUrlParser: true,
      });
     console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }

module.exports = connectDB;
