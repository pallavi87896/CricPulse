import mongoose from "mongoose";

const PlayerStatSchema=new mongoose.Schema
({

    match:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Match",
        required:true,
    },

    player:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Player",
        required:true
    },

    runs:{
        type:Number,
        required:true,
        default:0
    },
    
    balls:{
        type:Number,
        required:true,
        default:0
    },

    isOut:{
        type:Boolean,
        default:false
    },

    wicketsTaken:{
        type:Number,
        required:true,
        default:0
    },

    legalBallsBowled:{
        type:Number,
        required:true,
        default:0
    },

    runsConceded:{
        type:Number,
        required:true,
        default:0
    },

},{
    timestamps:true
}
);

const PlayerStats=mongoose.models.PlayerStats || mongoose.model("PlayerStats",PlayerStatSchema);

export default PlayerStats;