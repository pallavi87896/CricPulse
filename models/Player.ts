import mongoose from "mongoose";
const PlayerSchema=new mongoose.Schema({
    
    name:{
        type:String,
        required:true,
    },

    role:{
        type:String,
    },

    team:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Team",
        required:true
    }
},
{
    timestamps: true
}
);

const Player=mongoose.models.Player||mongoose.model("Player",PlayerSchema);
export default Player; 