import { NextRequest, NextResponse } from "next/server";
import { Ballot } from "~/lib/ballot";
import { createBallot, getAllBallots } from "~/lib/kv";

// GET /api/ballots - Get all ballots
export async function GET() {
    try {
        const ballots = await getAllBallots();
        return NextResponse.json({ ballots });
    } catch (error) {
        console.error("Error fetching ballots:", error);
        return NextResponse.json(
            { error: "Failed to fetch ballots" },
            { status: 500 }
        );
    }
}

// POST /api/ballots - Create a new ballot
export async function POST(request: NextRequest) {
    try {
        const { ballot } = await request.json();

        if (!ballot || !ballot.question) {
            return NextResponse.json(
                { error: "Invalid ballot data" },
                { status: 400 }
            );
        }

        const ballotData = ballot as Ballot;
        const ballotId = await createBallot(ballotData);

        return NextResponse.json({ success: true, ballotId });
    } catch (error) {
        console.error("Error creating ballot:", error);
        return NextResponse.json(
            { error: "Failed to create ballot" },
            { status: 500 }
        );
    }
} 