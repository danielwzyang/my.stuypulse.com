export const prerender = false

import type { APIRoute } from "astro"
import { serviceSupabase } from "../../../lib/supabase"

export const POST: APIRoute = async ({ request }) => {
    // attemping to fix csrf error with CORS headers
    const headers = { "Access-Control-Allow-Origin": "*" }

    try {
        const formData = await request.formData()

        // make sure the key is correct
        const key = request.headers.get("key")
        if (!key || key != import.meta.env.KIOSK_KEY) return new Response("Authorization key is incorrect.", { status: 403, headers })

        // fetch data from supabase
        let { data: meetings, error } = await serviceSupabase
            .from("attendance")
            .select("id_number, checked_out, only_checked_in")

        if (error || !meetings) return new Response("Error fetching user meetings: " + error?.message, { status: 500, headers })

        // converts the array of objects into one object
        const meetingsObj = meetings.reduce((obj, { id_number, checked_out, only_checked_in }) => {
            obj[id_number] = { checked_out: new Set(checked_out || []), only_checked_in: new Set(only_checked_in || []) }
            return obj
        }, {} as Record<string, { checked_out: Set<string>, only_checked_in: Set<string> }>)

        // read the checkin file
        const checkinsFile = formData.get("checkins") as File
        const checkinsText = await new Blob([checkinsFile], { type: "text/csv" }).text()

        // parse the checkin data
        let checkinsData = checkinsText.trim().split("\n").map((e) => e.split(","))
        checkinsData.shift() // gets rid of the headers row

        // updates the user meetings
        checkinsData.forEach((row) => {
            const date = row[0], id = row[1], userCheckedOut = row[5] !== ""

            // inits the key value pair if the key doesn't exist (ie the id is new)
            if (!(id in meetingsObj))
                meetingsObj[id] = { checked_out: new Set(), only_checked_in: new Set() }

            // adds the new meeting to the correct list
            meetingsObj[id][userCheckedOut ? "checked_out" : "only_checked_in"].add(date)

            // removes the date from the only checked in if they have now checked out
            if (userCheckedOut) meetingsObj[id]["only_checked_in"].delete(date)

            // adds the meeting to the list of all the meetings
            meetingsObj["all"].checked_out.add(date)
        })

        // read the attendance file
        const attendanceFile = formData.get("attendance") as File
        const attendanceText = await new Blob([attendanceFile], { type: "text/csv" }).text()

        // parse the attendance data
        let attendanceData = attendanceText.trim().split("\n").map((e) => e.split(","))
        attendanceData.shift() // gets rid of the headers row

        // convert the data into an array of objects
        const newData = attendanceData.map((
            [id_number, first_name, last_name, num_checkins, attendance_rate_percent, num_checkouts, checkout_rate_percent, total_hours, average_hours]) => {
            const checked_out = Array.from(meetingsObj[id_number].checked_out)
            const only_checked_in = Array.from(meetingsObj[id_number].only_checked_in)

            return { id_number, first_name, last_name, num_checkins, attendance_rate_percent, num_checkouts, checkout_rate_percent, total_hours, average_hours, checked_out, only_checked_in }
        })
        
        newData.push( { 
            id_number: "all", 
            first_name: "",
            last_name: "",
            num_checkins: "0",
            attendance_rate_percent: "",
            num_checkouts: "0",
            checkout_rate_percent: "", 
            total_hours: "0",
            average_hours: "0",
            checked_out: Array.from(meetingsObj["all"].checked_out),
            only_checked_in: Array.from(meetingsObj["all"].only_checked_in) 
        })

        // upsert the attendance data
        const { error: error2 } = await serviceSupabase
            .from("attendance")
            .upsert(newData)

        if (error2) return new Response("Error upserting attendance data: " + error2.message, { status: 500, headers })

        return new Response("Successfully posted data.", { status: 200, headers })
    } catch (error) {
        return new Response("Error posting data: " + error, { status: 500, headers })
    }
}