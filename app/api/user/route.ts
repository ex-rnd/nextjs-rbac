// File location: ./app/api/user/route.ts

import { getCurrentUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest) {

    try {

        const user = getCurrentUser();

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

    } catch (error) {
        
    }
    





















