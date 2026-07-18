import mongoose from "mongoose";

const BallEventSchema=new mongoose.Schema({
    match:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Match",
        required:true
    },

    striker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Player",
        required:true
    },

    nonStriker:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Player",
      required:true
    },
    
    bowler:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Player",
        required:true
    },

    ballType: {
      type: String,
      enum: ["Normal", "Wide", "NoBall", "Bye", "LegBye"],
      required: true,
    },

    batsmanRuns: {
      type: Number,
      required: true,
      default: 0,
    },

    wicket: {
      type: Boolean,
      default: false,
    },

    wicketType: {
      type: String,
      enum: [
        "Bowled",
        "Caught",
        "LBW",
        "Run Out",
        "Stumped",
        "Hit Wicket"
      ],
    },

    outPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },

    newBatsman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },

    newBowler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player"
    },

    extraRuns: {
      type: Number,
      default:0
    }

  },

  {
    timestamps: true,
  }

);

const BallEvent =
  mongoose.models.BallEvent ||
  mongoose.model("BallEvent", BallEventSchema);

export default BallEvent;