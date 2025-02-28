import { NextRequest, NextResponse } from "next/server";
import { addOptionToBallot } from "~/lib/kv";

// POST /api/ballots/[id]/options - Add an option to a ballot
export async function POST(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Await params before accessing its properties
        const { id } = await context.params;
        const { text, fid } = await request.json();

        if (!text || typeof text !== "string") {
            return NextResponse.json(
                { error: "Option text is required" },
                { status: 400 }
            );
        }

        if (!fid || typeof fid !== "number") {
            return NextResponse.json(
                { error: "User FID is required" },
                { status: 401 }
            );
        }

        const success = await addOptionToBallot(id, text);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to add option. Ballot may be closed or option already exists." },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error adding option:", error);
        return NextResponse.json(
            { error: "Failed to add option" },
            { status: 500 }
        );
    }
} 