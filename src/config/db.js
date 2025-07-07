const mongoose= require('mongoose');
const connectDB = async () => {
    try {
        console.log("MONGODB_URI:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, );
        console.log('MongoDB connection successful');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    }
}
module.exports = connectDB;