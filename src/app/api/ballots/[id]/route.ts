import { NextRequest, NextResponse } from "next/server";
import { getBallot } from "~/lib/kv";

// GET /api/ballots/[id] - Get a specific ballot
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params before accessing its properties
        const { id } = await params;
        const ballot = await getBallot(id);

        if (!ballot) {
            return NextResponse.json(
                { error: "Ballot not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ ballot });
    } catch (error) {
        console.error("Error fetching ballot:", error);
        return NextResponse.json(
            { error: "Failed to fetch ballot" },
            { status: 500 }
        );
    }
} 