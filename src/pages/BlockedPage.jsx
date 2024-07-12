import React from 'react'
import { useAuth } from '../context/authContext'
import { SiAdblock } from "react-icons/si";

function BlockedPage() {
    const auth = useAuth();
    return (
        <section className="flex items-center h-screen sm:p-16 dark:bg-gray-50 dark:text-gray-800">
            <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8 space-y-8 text-center sm:max-w-md">
                <SiAdblock size={72} color='red'/>
                <p className="text-3xl">Looks like you account has been blocked by the Admin</p>
                <button onClick={() => auth.logOut()} type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">Log out</button>
            </div>
        </section>
    )
}

export default BlockedPage