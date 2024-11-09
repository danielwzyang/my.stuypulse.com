export const prerender = false

import type { APIRoute } from "astro"
import { supabase } from "../../../lib/supabase"

export const POST: APIRoute = async ({ request, redirect }) => {
    const formData = await request.formData()
    const osis = formData.get("osis")?.toString(), password = formData.get("password")?.toString()

    // handling errors with osis and password input
    if (!osis || !password) return new Response("OSIS and password are required", { status: 400 })
    if (isNaN(Number(osis))) return new Response("Invalid OSIS", { status: 400 })

    // checks if the osis exists in the database
    const { error } = await supabase
        .from("total_attendance")
        .select("id_number")
        .eq("id_number", osis)
        .single()
    
    console.log(error)

    if (error) return new Response("OSIS not in database", { status: 500 })

    // register with supabase and handle any errors
    const { error: signUpError } = await supabase.auth.signUp({ email: osis + "@email.com", password })
    if (signUpError) return new Response(signUpError.message, { status: 500 })

    return redirect("/login")
}