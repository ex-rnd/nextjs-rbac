// File location: ./app/api/user/route.ts

import { getCurrentUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest) {

    try {

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    error: "You are not authorized to access user information."
                },
                {status: 401}
            );
        }
        const searchParams = request.nextUrl.searchParams;
        const teamId = searchParams.get("teamId");
        const role = searchParams.get("role");

        return NextResponse.json({ user, teamId, role });

    } catch (error) {
        console.error("Error :", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}





















