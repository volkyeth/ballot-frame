import { NextRequest, NextResponse } from "next/server";
import { voteForOption } from "~/lib/kv";

// POST /api/ballots/[id]/vote - Vote for an option in a ballot
export async function POST(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Await params before accessing its properties
        const { id } = await context.params;
        const { optionId, fid } = await request.json();

        if (!optionId || typeof optionId !== "string") {
            return NextResponse.json(
                { error: "Option ID is required" },
                { status: 400 }
            );
        }

        if (!fid || typeof fid !== "number") {
            return NextResponse.json(
                { error: "User FID is required" },
                { status: 401 }
            );
        }

        const success = await voteForOption(id, optionId, fid);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to vote. Ballot may be closed or you already voted for this option." },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error voting:", error);
        return NextResponse.json(
            { error: "Failed to vote" },
            { status: 500 }
        );
    }
} 