import React from 'react'
import { AiFillSetting } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { BiSolidPurchaseTag } from "react-icons/bi";


function Sidebar() {
  return (
    <aside id="logo-sidebar" className="fixed top-0 left-0 z-0 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0" aria-label="Sidebar">
        <div className="h-full px-3 pt-10 pb-4 overflow-y-auto bg-white">
            <ul className="space-y-2 font-medium">
                <li>
                    <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <FaUsers size={28} />   
                    <span className="ms-3">Users</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <BiSolidPurchaseTag size={28} />
                    <span className="ms-3">Purchase orders</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <AiFillSetting size={28} />
                    <span className="ms-3">Settings</span>
                    </a>
                </li>
            </ul>
        </div>
    </aside>
  )
}

export default Sidebar