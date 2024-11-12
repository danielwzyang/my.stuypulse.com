export const prerender = false

import type { APIRoute } from "astro"
import { supabase } from "../../../lib/supabase"

export const GET: APIRoute = async ({ request }) => {
    const osis = new URL(request.url).searchParams.get("osis")
    // fetches the meetings that the user attended and all the meetings
    // data should be an array; the first element is the user's meetings, second is all the meetings
    const { data, error } = await supabase
        .from("meetings")
        .select("meetings")
        .in("id", [osis, "all"])

    // handles any errors
    if (error) return new Response("Error while fetching user data", { status: 400 })
        
    return new Response(JSON.stringify(data.map(e => e.meetings)))
}