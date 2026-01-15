/* This is a user signup page and it does Server Side Rendering*/

import SignupForm from "./SignupForm"

//Static data runs on server
export const metadata = {
    title : "Signup",
    description: "Create a new account"
}

//It is async to allow await calls such as cookies,flags etc.
export default async function SignupPage() {
    // SSR logic (example: feature flags, config, session check)
    const signupEnabled = true

    return(
        <div className="signup-container">
            <h1>Create Account</h1>
            {signupEnabled ? (<SignupForm />) : (<p>Sign up is currently disabled</p>)}
        </div>
    )
}