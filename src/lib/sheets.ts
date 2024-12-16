import { GoogleAuth } from "google-auth-library"
import { google, sheets_v4 } from "googleapis"

let auth: GoogleAuth
let sheets: sheets_v4.Sheets

export async function setAuth() {
    if (!auth) {
        auth = new google.auth.GoogleAuth({
            credentials: {
                private_key: import.meta.env.SHEETS_PRIVATE_KEY,
                client_email: import.meta.env.SHEETS_EMAIL
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        })

        sheets = google.sheets({ version: "v4", auth })
    }
}

export async function getSheets() {
    setAuth()
    return sheets
}