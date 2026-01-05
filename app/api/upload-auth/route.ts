import { getUploadAuthParams } from "@imagekit/next/server";
import { NextRequest, NextResponse } from "next/server";
const privateKey = process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
export async function GET(request: NextRequest) {
  try {
    // Lấy session/token từ request để xác thực user (nếu cần)
    // const session = await getSession(request);
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Kiểm tra environment variables

    if (!privateKey || !publicKey) {
      console.error("ImageKit credentials are not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Tạo authentication parameters
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: privateKey,
      publicKey: publicKey,
      // expire: 30 * 60, // 30 minutes (tối đa 1 giờ)
      // token: crypto.randomUUID(), // Có thể tự tạo token nếu muốn
    });

    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey,
    });
  } catch (error) {
    console.error("Error generating upload auth params:", error);
    return NextResponse.json(
      { error: "Failed to generate upload parameters" },
      { status: 500 }
    );
  }
}
