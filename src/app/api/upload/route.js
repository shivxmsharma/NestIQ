import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import crypto from "crypto";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paramsToSign } = await request.json();

  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");
  
  const signature = crypto
    .createHash("sha256")
    .update(sortedParams + apiSecret)
    .digest("hex");
  
  return NextResponse.json({ signature });
}