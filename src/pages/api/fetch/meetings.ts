export const prerender = false

import type { APIRoute } from "astro"
import { supabase } from "../../../lib/supabase"

export const GET: APIRoute = async ({ request }) => {
    const osis = new URL(request.url).searchParams.get("osis")
    // fetches the meetings that the user attended and all the meetings
    // data should be an array; the first element is the user's meetings, second is all the meetings
    const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .in("id", [osis, "all"])
        .order("id", { ascending: true })

    if (error) return new Response(error.message, { status: 500 })
    return new Response(JSON.stringify(data))
}