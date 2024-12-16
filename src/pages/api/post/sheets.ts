import type { APIRoute } from "astro"
import { getSheets } from "../../../lib/sheets"

export const POST: APIRoute = async ({ request }) => {
    const formData = await request.formData()
    const first_name = formData.get("first_name")
    const last_name = formData.get("last_name")
    
    const sheets = await getSheets()
    const spreadsheetId = import.meta.env.SHEETS_ID

    try {
        const newbies = await sheets.spreadsheets.values.get({ spreadsheetId, range: "'Newbies'!B:E" })
        for (const newbie of newbies.data.values || []) {
            const [first, last, safety_test, dues] = newbie
            if (first === first_name && last === last_name)
                return new Response(JSON.stringify({ safety_test, dues }), { status: 200 })
        }

        const veterans = await sheets.spreadsheets.values.get({ spreadsheetId, range: "'Veterans'!B:E" })
        for (const veteran of veterans.data.values || []) {
            const [first, last, safety_test, dues] = veteran
            if (first.trim() === first_name && last.trim() === last_name)
                return new Response(JSON.stringify({ safety_test, dues }), { status: 200 })
        }
    } catch (error) {
        console.log(error)
        return new Response("Error retrieving sheets data.", { status: 500 })
    }

    return new Response("User not found in sheets.", { status: 500 })
}