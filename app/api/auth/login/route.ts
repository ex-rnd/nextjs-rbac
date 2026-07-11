// File location: ./app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { Prisma } from "@prisma/client";
import { generateToken, verifyPassword } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const {email, password} = await request.json();
        // Validate required fields 
        if (!email || !password) {
            return NextResponse.json({
                error: "Email & password are required or not valid",
            },
            {status: 400}
          );
        }

        // Find existing user 
        const userFromDb = await prisma.user.findUnique({
            where: {email},
            include: {team: true}
        });

        if (!userFromDb) {
            return NextResponse.json(
                {
                    error: "Invalid Credentials",
                },
                {status: 401}
            )
        }

        const isValidPassword = await verifyPassword(password, userFromDb.password);

        if (!isValidPassword) {
            return NextResponse.json(
                {
                    error: "Invalid Credentials",
                },
                {status: 401}
            )
        }

        // Generate Token 
        const token = generateToken(userFromDb.id);

        // Create Response 
        const response = NextResponse.json({
            user: {
                id: userFromDb.id,
                email: userFromDb.email,
                name: userFromDb.name,
                role: userFromDb.role,
                teamId: userFromDb.teamId,
                team: userFromDb.team,
                token,
            },
        });

        // Set Cookie 
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60*60*24*7,
        });

        return response;

    } catch (error) {

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { error: "User with this email address exists" },
                { status: 409 }
            );
        }
        
        console.error("Login failed", error);
        return NextResponse.json({
            error: "Internal Server Error. Something went error!",
        },
        {status: 500}
    );
    }
}





















