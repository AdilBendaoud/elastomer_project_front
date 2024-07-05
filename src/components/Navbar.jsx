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
   
    <nav className="fixed top-0 z-10 w-full bg-white border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start rtl:justify-end">
                    <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                        <span className="sr-only">Open sidebar</span>
                        <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                        </svg>
                    </button>
                    <img src="./static/images/elastomer-logo.jpeg" width={130}  alt="Elastomer Solution Logo" />
                </div>
                <div>
                    <ul  className=" border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white">
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