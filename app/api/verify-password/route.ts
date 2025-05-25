import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === process.env.LETTER_PASSWORD) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Sai mật khẩu" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json({ success: false, error: "Lỗi không xác định" }, { status: 500 });
  }
}