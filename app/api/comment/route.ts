import Comment from "@/models/Comment";
import Match from "@/models/Match";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { match, username, comment } = await req.json();

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

        const comments = await Comment.create({
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

        const comments = await Comment.find({ match });

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

        const deletedComment = await Comment.findByIdAndDelete(id);

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