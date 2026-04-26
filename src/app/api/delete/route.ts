import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function DELETE(request: Request): Promise<NextResponse> {
  const { url } = (await request.json()) as { url: string };
  await del(url);
  return NextResponse.json({ deleted: true });
}
