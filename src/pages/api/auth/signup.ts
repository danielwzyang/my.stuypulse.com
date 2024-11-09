export const prerender = false

import type { APIRoute } from "astro"
import { supabase } from "../../../lib/supabase"

export const POST: APIRoute = async ({ request, redirect }) => {
    const formData = await request.formData()
    const osis = formData.get("osis")?.toString(), password = formData.get("password")?.toString()

    // TODO: handle errors with the api and display as text in form page

    // handling errors with osis and password input
    if (!osis || !password) return new Response("OSIS and password are required", { status: 400 })
    if (isNaN(Number(osis))) return new Response("Invalid OSIS", { status: 400 })

    // TODO: add check for osis to see if it's in database

    // register with supabase and handle any errors
    const { error } = await supabase.auth.signUp({ email: osis + "@email.com", password })
    if (error) return new Response(error.message, { status: 500 })

    return redirect("/login")
}