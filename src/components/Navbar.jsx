import React from 'react'
import { useAuth } from '../context/authContext'
import { IoLogOutOutline } from "react-icons/io5";

function Navbar() {
    const auth = useAuth();
    return (
        <nav className="fixed top-0 z-10 w-full bg-white border-b border-gray-200">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">
                        <img src="../static/images/elastomer-logo.png" width={130} alt="Elastomer Solution Logo" />
                    </div>
                    <div>
                        <ul className="flex border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white">
                            <li className='flex items-center'>
                                <span className='text-centre'>Welcome {auth.user.firstName + " " + auth.user.lastName}</span>
                            </li>
                            <li className='flex items-center'>
                                <button
                                    onClick={() => auth.logOut()}
                                    type="button"
                                    className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-3 me-2 mb-2"
                                >
                                    <>
                                        <span className='mr-3'>
                                            Log out
                                        </span>
                                        <IoLogOutOutline size={24} />
                                    </>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar