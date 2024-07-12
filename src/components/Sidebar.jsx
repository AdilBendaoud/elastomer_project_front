import React from 'react'
import { AiFillSetting } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';


function Sidebar() {
    const location = useLocation();
    const currentPath = location.pathname;
    const { user } = useAuth();

    const getLinkClasses = (path) => {
        return currentPath === path
            ? 'flex items-center p-2 bg-blue-500 text-white rounded-lg  hover:bg-blue-500 hover:text-white group'
            : 'flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group';
    };
    //className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-blue-500 hover:text-white group"

    return (
        <aside id="logo-sidebar" style={user.role !== "A" ? { display: "none" } : {}} className="fixed top-0 left-0 z-0 w-64 h-screen pt-5 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0" aria-label="Sidebar">
            <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
                <div className="flex items-center justify-start rtl:justify-end">
                    <img src="./static/images/elastomer-logo.jpeg" width={130} alt="Elastomer Solution Logo" />
                </div>
                <ul className="pt-10 space-y-2 font-medium">
                    <li>
                        <Link to={'/'} className={getLinkClasses('/')} >
                            <FaUsers size={28} />
                            <span className="ms-3">Users</span>
                        </Link>
                    </li>
                    <li>
                        <Link to={'/request-list'} className={getLinkClasses('/request-list')}>
                            <BiSolidPurchaseTag size={28} />
                            <span className="ms-3">Purchase orders</span>
                        </Link>
                    </li>
                    <li>
                        <Link to={'settings'} className={getLinkClasses('/settings')}>
                            <AiFillSetting size={28} />
                            <span className="ms-3">Settings</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    )
}

export default Sidebar