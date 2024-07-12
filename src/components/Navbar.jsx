import React from 'react'
import { useAuth } from '../context/authContext'

function Navbar() {
    const auth = useAuth();
  return (
    // <nav classNameName="bg-white border-gray-200">
    // <div classNameName="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
    //     <a href="/" classNameName="flex items-center space-x-3 rtl:space-x-reverse">
    //         <img src="./static/images/elastomer-logo.jpeg" width={170}  alt="Elastomer Solution Logo" />
    //     </a>
    //     <button data-collapse-toggle="navbar-default" type="button" classNameName="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" aria-controls="navbar-default" aria-expanded="false">
    //         <span classNameName="sr-only">Open main menu</span>
    //         <svg classNameName="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
    //             <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
    //         </svg>
    //     </button>
    //     <div classNameName="hidden w-full md:block md:w-auto" id="navbar-default">
    //         <ul  classNameName="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white">
    //             <li classNameName='flex items-center'>
    //                 <p classNameName='text-centre'>Welcome {auth.user.firstName+" "+auth.user.lastName}</p>
    //             </li>
    //             <li classNameName='flex items-center'>
    //                 <button onClick={()=>auth.logOut()} type="button" classNameName="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">Log out</button>
    //             </li>
    //         </ul>
    //     </div>
    // </div>
    // </nav>
   
    <nav className="fixed top-0 z-0 w-full bg-white border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start rtl:justify-end">
                    <img src="./static/images/elastomer-logo.jpeg" width={130}  alt="Elastomer Solution Logo" />
                </div>
                <div>
                    <ul  className="flex border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white">
                        <li className='flex items-center'>
                            <span className='text-centre'>Welcome {auth.user.firstName+" "+auth.user.lastName}</span>
                        </li>
                        <li className='flex items-center'>
                            <button onClick={()=>auth.logOut()} type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">Log out</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
  )
}

export default Navbar