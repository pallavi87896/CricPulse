import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment =
  mongoose.models.Comment ||
  mongoose.model("Comment", CommentSchema);

export default Comment;