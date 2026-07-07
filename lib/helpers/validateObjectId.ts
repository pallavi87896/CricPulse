import mongoose from "mongoose";

export function validateObjectId(id : string)
{
    return mongoose.Types.ObjectId.isValid(id);
}
