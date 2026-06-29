import mongoose from "mongoose";

const url=process.env.MONGODB_URL!;

export async function connectDB(){
    try{
        if (mongoose.connection.readyState === 1) {
            return;
        }
        await mongoose.connect(url);
        console.log("✅ mongodb connected")
    }
    catch(err){
        console.error(" mongodb connection error",err);
        throw err;
    }
}