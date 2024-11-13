export const prerender = false

import type { APIRoute } from "astro"
import { supabase } from "../../../lib/supabase"

export const GET: APIRoute = async ({ request }) => {
    const osis = new URL(request.url).searchParams.get("osis")
    // fetches the meetings that the user attended and all the meetings
    // data should be an array; the first element is the user's meetings, second is all the meetings
    const { data: userMeetings, error: error1 } = await supabase
        .from("meetings")
        .select("meetings")
        .eq("id", osis)

    if (error1) return new Response(error1.message, { status: 500 })

    const { data: allMeetings, error: error2 } = await supabase
        .from("meetings")
        .select("meetings")
        .eq("id", "all")

    if (error2) return new Response(error2.message, { status: 500 })
    
    const data = [userMeetings[0].meetings, allMeetings[0].meetings]

    return new Response(JSON.stringify(data))
}