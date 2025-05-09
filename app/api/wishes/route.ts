import { NextResponse } from "next/server"
// import { kv } from "@vercel/kv"

import { firestore } from "@/lib/firebase";

const COLLECTION_NAME = "wishes";

// GET handler to retrieve all wishes
export async function GET() {
  try {
    console.log("API: Đang tải đóng góp từ Cơ sở dữ liệu");

    const snapshot = await firestore.collection(COLLECTION_NAME).get();
    const wishes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log("API: Đóng góp đã tải:", wishes);
    return NextResponse.json({ wishes });
  } catch (error) {
    console.error("API Lỗi khi tải đóng góp:", error);
    return NextResponse.json(
      { wishes: [], error: error instanceof Error ? error.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}

// POST handler to add a new wish
export async function POST(request: Request) {
  try {
    console.log("API: Đã nhận yêu cầu gửi đóng góp");

    const wish = await request.json();

    // Add a new wish to Firestore
    const newWishRef = firestore.collection(COLLECTION_NAME).doc();
    const newWish = {
      id: Date.now().toString(),
      ...wish,
      date: new Date().toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    await newWishRef.set(newWish);

    console.log("API: Đóng góp đã tải:", newWish);
    return NextResponse.json({ success: true, wish: newWish });
  } catch (error) {
    console.error("API Lỗi khi tải đóng góp:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Lỗi không xác định" },
      { status: 500 }
    );
  }
}

// GET handler to retrieve all wishes
// export async function GET() {
//   try {
//     console.log("API: Đang tải đóng góp từ Vercel KV")
//     // Get wishes from Vercel KV
//     const wishes = await kv.get("wishes")
//     console.log("API: Đóng góp đã tải:", wishes)
//     return NextResponse.json({ wishes: wishes || [] })
//   } catch (error) {
//     console.error("API Lỗi khi tải đóng góp:", error)
//     return NextResponse.json(
//       { wishes: [], error: error instanceof Error ? error.message : "Lỗi không xác định" },
//       { status: 500 },
//     )
//   }
// }

// // POST handler to add a new wish
// export async function POST(request: Request) {
//   try {
//     console.log("API: Đã nhận yêu cầu gửi đóng góp")
//     // Parse the incoming wish data
//     const wish = await request.json()

//     // Get existing wishes
//     console.log("API: Đang tải đóng góp hiện có từ Vercel KV")
//     const existingWishes = (await kv.get("wishes")) || []

//     // Create new wish with ID and date
//     const newWish = {
//       id: Date.now().toString(),
//       ...wish,
//       date: new Date().toLocaleDateString("vi-VN", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       }),
//     }

//     console.log("API: Đã tạo đóng góp mới:", newWish)

//     // Add the new wish to the array
//     const updatedWishes = Array.isArray(existingWishes) ? [...existingWishes, newWish] : [newWish]

//     // Save back to Vercel KV
//     console.log("API: Đang lưu đóng góp đã cập nhật vào Vercel KV")
//     await kv.set("wishes", updatedWishes)
//     console.log("API: Đã lưu đóng góp thành công")

//     return NextResponse.json({ success: true, wish: newWish })
//   } catch (error) {
//     console.error("API Lỗi khi lưu đóng góp:", error)
//     return NextResponse.json(
//       { success: false, error: error instanceof Error ? error.message : "Lỗi không xác định" },
//       { status: 500 },
//     )
//   }
// }
