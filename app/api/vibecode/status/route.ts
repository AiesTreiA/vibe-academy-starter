import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { VIBECODE_CONFIG } from "@/lib/vibecode-config"

// Force dynamic execution since we use server time and database counts
export const dynamic = "force-dynamic"

function calculatePricing(now: Date) {
  const d1 = new Date(VIBECODE_CONFIG.d1)
  const d2 = new Date(VIBECODE_CONFIG.d2)
  const d3 = new Date(VIBECODE_CONFIG.d3)
  const launch = new Date(VIBECODE_CONFIG.launchDate)
  const basePrice = 297

  if (now < d1) {
    return { phase: 1, price: 209, discount: 30, deadline: d1 }
  } else if (now < d2) {
    return { phase: 2, price: 237, discount: 20, deadline: d2 }
  } else if (now < d3) {
    return { phase: 3, price: 265, discount: 10, deadline: d3 }
  } else {
    // Price Full
    return { phase: 4, price: basePrice, discount: 0, deadline: launch }
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient() as any

    // 1. Get seats taken for Generation 2 (starting 2026-09-01)
    const gen2StartDate = VIBECODE_CONFIG.timelineStart || "2026-09-01T00:00:00-04:00"
    const { count, error: countError } = await supabase
      .from("vibecode_registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")
      .gte("created_at", gen2StartDate)

    if (countError) {
      console.error("Error fetching registrations count:", countError)
    }

    const realGen2Count = count || 0
    // Floor is 2 until actual Generation 2 enrollments reach 2 or more, then show real count
    const seatsTaken = Math.max(2, realGen2Count)

    // 2. Get settings
    const { data: settings, error: settingsError } = await supabase
      .from("vibecode_settings")
      .select("key, value")

    let totalSeats = VIBECODE_CONFIG.maxSeats || 11
    let goldenSeats = 8

    if (!settingsError && settings) {
      const maxSeatsRow = settings.find((r: any) => r.key === "max_seats")
      if (maxSeatsRow) totalSeats = parseInt(maxSeatsRow.value, 10)

      const goldSeatsRow = settings.find((r: any) => r.key === "golden_seats")
      if (goldSeatsRow) goldenSeats = parseInt(goldSeatsRow.value, 10)
    }

    const now = new Date()
    const { phase, price, discount, deadline } = calculatePricing(now)

    let goldenRemaining = goldenSeats - seatsTaken
    if (goldenRemaining < 0) goldenRemaining = 0

    const secondsRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000))
    const launchDate = new Date(VIBECODE_CONFIG.launchDate)

    return NextResponse.json({
      total_seats: totalSeats,
      seats_taken: seatsTaken,
      seats_remaining: Math.max(0, totalSeats - seatsTaken),
      golden_spots_remaining: goldenRemaining,
      active_phase: phase,
      active_price: price,
      discount_percentage: discount,
      next_phase_deadline: deadline.toISOString(),
      seconds_to_next_phase: secondsRemaining,
      official_launch_date: launchDate.toISOString(),
    })
  } catch (err: any) {
    console.error("Failed to run status API:", err)
    // Safe mock fallback if database connection fails
    const fallbackTotal = VIBECODE_CONFIG.maxSeats || 11
    return NextResponse.json({
      total_seats: fallbackTotal,
      seats_taken: 2,
      seats_remaining: Math.max(0, fallbackTotal - 2),
      golden_spots_remaining: 3,
      active_phase: 1,
      active_price: 209,
      discount_percentage: 30,
      next_phase_deadline: new Date(VIBECODE_CONFIG.d1).toISOString(),
      seconds_to_next_phase: 200000,
      official_launch_date: new Date(VIBECODE_CONFIG.launchDate).toISOString(),
    })
  }
}
