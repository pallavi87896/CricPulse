import Team from "@/models/Team";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {

    try {

        await requireAdmin(req);
        await connectDB();

        const { name, logo } = await req.json();

        if (!name || name.trim() === "") {
            return Response.json(
                {
                    msg: "Team name is required",
                },
                {
                    status: 400,
                }
            );
        }

        const team = await Team.create({
            name,
            logo,
        });

        return Response.json(team, {
            status: 201,
        });
    } catch (err) {
        return Response.json(
            {
                msg: "Failed to create team",
            },
            {
                status: 500,
            }
        );
    }
}

export async function GET() {
    try {
        await connectDB();

        const teams = await Team.find();

        return Response.json(teams);
    } catch (err) {
        return Response.json(
            {
                msg: "Failed to fetch teams",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {

        await requireAdmin(req);
        await connectDB();

        const { id, name, logo } = await req.json();

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

        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            { name, logo },
            { new: true }
        );

        if (!updatedTeam) {
            return Response.json(
                {
                    msg: "Team not found",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json(updatedTeam);
    } catch (err) {
        return Response.json(
            {
                msg: "Failed to update team",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {

        await requireAdmin(req);
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

        const delTeam = await Team.findByIdAndDelete(id);

        if (!delTeam) {
            return Response.json(
                {
                    msg: "Team not found",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json({
            msg: "Team deleted successfully",
        });
    } catch (err) {
        return Response.json(
            {
                msg: "Failed to delete team",
            },
            {
                status: 500,
            }
        );
    }
}