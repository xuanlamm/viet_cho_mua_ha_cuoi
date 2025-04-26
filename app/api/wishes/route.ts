import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// GET handler to retrieve all wishes
export async function GET() {
  try {
    console.log("API: Fetching wishes from Vercel KV")
    // Get wishes from Vercel KV
    const wishes = await kv.get("wishes")
    console.log("API: Wishes retrieved:", wishes)
    return NextResponse.json({ wishes: wishes || [] })
  } catch (error) {
    console.error("API Error fetching wishes:", error)
    return NextResponse.json(
      { wishes: [], error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// POST handler to add a new wish
export async function POST(request: Request) {
  try {
    console.log("API: Received wish submission request")
    // Parse the incoming wish data
    const wish = await request.json()

    // Get existing wishes
    console.log("API: Fetching existing wishes from Vercel KV")
    const existingWishes = (await kv.get("wishes")) || []

    // Create new wish with ID and date
    const newWish = {
      id: Date.now().toString(),
      ...wish,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }

    console.log("API: Created new wish:", newWish)

    // Add the new wish to the array
    const updatedWishes = Array.isArray(existingWishes) ? [...existingWishes, newWish] : [newWish]

    // Save back to Vercel KV
    console.log("API: Saving updated wishes to Vercel KV")
    await kv.set("wishes", updatedWishes)
    console.log("API: Successfully saved wishes")

    return NextResponse.json({ success: true, wish: newWish })
  } catch (error) {
    console.error("API Error saving wish:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
