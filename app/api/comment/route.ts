import CommentModel from "@/models/CommentModel";
import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { match, username, comment } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(match)) {
                    return Response.json(
                        {
                            msg: "Invalid team ID",
                        },
                        {
                            status: 400,
                        }
                    );
        }
        
        if(!username || !match  || !comment)
        {
            return Response.json({
                msg:"one of the fields is missing"
            },
        {
            status:400
        })
        }

        const existingMatch = await Match.findById(match);

        if (!existingMatch) {
            return Response.json(
                {
                    msg: "Match not found",
                },
                {
                    status: 404,
                }
            );
        }

        const comments = await CommentModel.create({
            match,
            username,
            comment,
        });

        return Response.json(comments);

    } catch (err) {
        return Response.json(
            {
                msg: "Error commenting",
            },
            {
                status: 500,
            }
        );
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        const match = searchParams.get("match");

        if(!match){
            return Response.json
            (
            {
                msg:"match not found"
            },
            {
                status:400
            }
            );
        }

        const comments = await CommentModel.find({ match });

        return Response.json(comments);

    } catch (err) {
        return Response.json(
            {
                msg: "Comments not found",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        await connectDB();

        const { id } = await req.json();

                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return Response.json(
                        {
                            msg: "Invalid team ID",
                        },
                        {
                            status: 400,
                        }
                    );
                }

        const deletedComment = await CommentModel.findByIdAndDelete(id);

        if (!deletedComment) {
            return Response.json(
                {
                    msg: "Comment not found",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json({
            msg: "Comment deleted successfully",
        });

    } catch (err) {
        return Response.json(
            {
                msg: "Cannot delete comment",
            },
            {
                status: 500,
            }
        );
    }
}