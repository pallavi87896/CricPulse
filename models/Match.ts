import mongoose from "mongoose";
const MatchSchema=new mongoose.Schema({

    teamA:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Team",
        required:true,
    },

    status:{
        type:String,
        enum:[
            "Live",
            "Upcoming",
            "Ended"
        ],
        required:true,
    },

    teamB:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Team",
        required:true,
    },

    tossWinner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },

    tossDecision:{
        type:String,
        enum:["Bat","Bowl"],
        required:true,
    },

    innings:{
        type:Number,
        enum:[1,2],
        required:true
    },

    score:{
        type:Number,
        required:true,
        default:0
    },

    wickets:{
        type:Number,
        required:true,
        default:0
    },

    extras:{
        type:Number,
        default:0,
        required:true
    },

    legalBalls:{
        type:Number,
        required:true,
        default:0,  
    },
    
    currNonStriker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Player",
        required:true
    },

    currStriker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Player",
        required:true
    },

    currBowler:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Player",
        required:true
    },

    target:{
        type:Number,
        default:0
    },

    likes: {
    type: Number,
    default: 0
    }
},

{
    timestamps:true
}
);

const Match=mongoose.models.Match||mongoose.model("Match",MatchSchema);

export default Match; 