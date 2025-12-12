import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const id = parseInt(projectId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "projectId must be a valid number" },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({
      where: { id },
      select: { 
        id: true,
        name: true,
        locked: true 
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      projectId: project.id,
      name: project.name,
      locked: project.locked,
      status: project.locked ? "locked" : "unlocked",
    });
  } catch (error) {
    console.error("Error checking lock status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { projectId?: unknown };
    const { projectId } = body;

    if (!projectId && projectId !== 0) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    let id: number;
    if (typeof projectId === 'number') {
      id = projectId;
    } else if (typeof projectId === 'string') {
      id = parseInt(projectId);
    } else {
      return NextResponse.json(
        { error: "projectId must be a number or string" },
        { status: 400 }
      );
    }
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "projectId must be a valid number" },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({
      where: { id },
      select: { 
        id: true,
        name: true,
        locked: true 
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      projectId: project.id,
      name: project.name,
      locked: project.locked,
      status: project.locked ? "locked" : "unlocked",
    });
  } catch (error) {
    console.error("Error checking lock status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
