"use client"

import { useState } from "react"

export default function SignupForm(){
    const [form,setForm] = useState({
        name : "",
        email: "",
        password: ""
    })

    const [loading,setLoading] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        setForm({...form, [e.target.name]:e.target.value})
    }

    async function handlSubmit(e: React.FormEvent){
        e.preventDefault()
        setLoading(true)

        // simulate API call
        await new Promise((res) => setTimeout(res, 1000))

        console.log("Signup data:", form)
        setLoading(false)
    }

    return(
        <form onSubmit={handlSubmit} className="signup-form">
            <input name = "name" placeholder="Full Name" value= {form.name} onChange={handleChange} required />
        </form>
    )
}