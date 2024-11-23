export const prerender = false

import type { APIRoute } from "astro"
import { serviceSupabase } from "../../../lib/supabase"

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData()

        // make sure the key is correct
        const key = request.headers.get("key")
        if (!key || key != import.meta.env.KIOSK_KEY) return new Response("Authorization key is incorrect.", { status: 403 })

        // read the checkin file
        const checkinsFile = formData.get("checkins") as File
        const checkinsText = await new Blob([checkinsFile], { type: "text/plain" }).text()

        // fetch past data from the supabase
        let { data: meetings, error: error1 } = await serviceSupabase
            .from("meetings")
            .select("*")

        if (error1 || !meetings) return new Response("Error fetching user meetings: " + error1?.message, { status: 500 })

        // converts the array of objects into one object
        const meetingsObj = meetings.reduce((obj, { id, checkedOut, onlyCheckedIn }) => {
            // the first element of the value is checkedOut and the second is onlyCheckedIn
            obj[id] = { checkedOut: new Set(checkedOut), onlyCheckedIn: new Set(onlyCheckedIn) }
            return obj
        }, {})

        // parse the checkin data
        let checkinsData = checkinsText.trim().split("\n").map((e) => e.split(","))
        checkinsData.shift() // gets rid of the headers row

        // updates the user meetings
        checkinsData.forEach((row) => {
            const date = row[0], id = row[1], checkedOut = row[5] !== ""

            // inits the key value pair if the key doesn't exist (ie the id is new)
            if (!(id in meetingsObj))
                meetingsObj[id] = { checkedOut: new Set(), onlyCheckedIn: new Set() }

            // adds the new meeting to the correct list
            meetingsObj[id][checkedOut ? "checkedOut" : "onlyCheckedIn"].add(date)

            // removes the date from the only checked in if they have now checked out
            if (checkedOut) meetingsObj[id]["onlyCheckedIn"].delete(date)

            // adds the meeting to the list of all the meetings
            meetingsObj["all"]["checkedOut"].add(date)
        })

        // converting the object back into an array of objects
        const newCheckinData = Object.entries(meetingsObj).map(([key, value]) => {
            const data = value as { checkedOut: string, onlyCheckedIn: string }
            return {
                id: key,
                checkedOut: Array.from(data["checkedOut"]),
                onlyCheckedIn: Array.from(data["onlyCheckedIn"])
            }
        })

        // upsert the checkin data
        const { error: error2 } = await serviceSupabase
            .from("meetings")
            .upsert(newCheckinData)

        if (error2) return new Response("Error upserting checkin data: " + error2.message, { status: 500 })



        // read the attendance file
        const attendanceFile = formData.get("attendance") as File
        const attendanceText = await new Blob([attendanceFile], { type: "text/plain" }).text()

        // parse the attendance data
        let attendanceData = attendanceText.trim().split("\n").map((e) => e.split(","))
        attendanceData.shift() // gets rid of the headers row

        // convert the data into an array of objects
        const newAttendanceData = attendanceData.map((
            [id_number, first_name, last_name, num_checkins, attendance_rate_percent, num_checkouts, checkout_rate_percent, total_hours, average_hours]) => {
            return { id_number, first_name, last_name, num_checkins, attendance_rate_percent, num_checkouts, checkout_rate_percent, total_hours, average_hours }    
        })

        // upsert the attendance data
        const { error: error3 } = await serviceSupabase
            .from("total_attendance")
            .upsert(newAttendanceData)

        if (error3) return new Response("Error upserting attendance data: " + error3.message, { status: 500 })

        return new Response("Successfully posted data.")
    } catch (error) {
        return new Response("Error posting data: " + error)
    }
}