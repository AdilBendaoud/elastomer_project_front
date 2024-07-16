import React, { useState } from 'react'
import { IoMdAdd } from 'react-icons/io'
import { useAuth } from '../context/authContext';
import RequestModal from '../components/RequestModal';
import axios from 'axios';
import swal from 'sweetalert';
import Swal from 'sweetalert2';
import { useQuery } from 'react-query';
import { FaEye } from 'react-icons/fa';
import { PiPencilSimpleLine } from "react-icons/pi";
import RequestHistory from '../components/RequestHistory';
import { FaCircleXmark, FaClockRotateLeft, FaFileCirclePlus } from "react-icons/fa6";
import ShowArticles from '../components/ShowArticles';
import { FiSend } from "react-icons/fi";
import SupplierSelectionModal from '../components/SupplierSelectionModal';
import { useNavigate } from "react-router-dom";

const fetchAllRequests = async (code, pageNumber, pageSize,) => {
    let url = `${process.env.REACT_APP_API_ENDPOINT}/Demande?userCode=${code}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

    // // Add search query parameter if provided
    // if (searchQuery) {
    //   url += `&search=${encodeURIComponent(searchQuery)}`;
    // }

    // // Add role filter parameter if provided
    // if (role && role !== 'All') {
    //   url += `&role=${encodeURIComponent(role)}`;
    // }

    // // Add department filter parameter if provided
    // if (department && department !== 'All') {
    //   url += `&department=${encodeURIComponent(department)}`;
    // }

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
        }
    });
    return res.json();
};

const fetchArticle = async (demandeCode) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${demandeCode}/articles`)
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

const fetchHistory = async (demandeCode) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${demandeCode}/history`)
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

function RequestList() {
    const navigate = useNavigate();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isRequestHistoryModalOpen, setIsRequestHistoryModalOpen] = useState(false);
    const [isRequestDetailsModalOpen, setIsRequestDetailsModalOpen] = useState(false);
    const [isSupplierSelectiomModalOpen, setIsSupplierSelectiomModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedRequestHistory, setSelectedRequestHistory] = useState(null);
    const [code, setCode] = useState('');
    const [articles, setArticles] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { data: requests, isLoading, refetch, error } = useQuery(
        ["requests", user.code, currentPage, itemsPerPage],
        () => fetchAllRequests(user.code, currentPage, itemsPerPage)
    );

    const getCode = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/generate-code/${user.code}`)
            setCode(response.data.code);
            setLoading(false)
        } catch (err) {
            swal({
                title: "Error !",
                icon: "error",
                text: err.message,
                buttons: false,
                timer: 1500,
            })
            setLoading(false);
        }
    }

    const openCreatRequestModal = async () => {
        getCode();
        setArticles([]);
        setSelectedRequest(null)
        setModalMode('create');
        setIsRequestModalOpen(true);
    }

    const openUpdateRequestModal = async (request) => {
        const articles = await fetchArticle(request.code);
        setArticles(articles);
        setCode(request.code)
        setSelectedRequest(request);
        setModalMode('update');
        setIsRequestModalOpen(true);
    }

    const openRequestHistoryModal = async (request) => {
        const history = await fetchHistory(request.code);
        setSelectedRequestHistory(history);
        setIsRequestHistoryModalOpen(true);
    }

    const cancelRequest = async (request) => {
        // Show confirmation dialog using SweetAlert
        const confirmed = await Swal.fire({
            title: "Cancel Request",
            text: "Are you sure you want to cancel the request ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: "Yes"
        });

        if (confirmed.isConfirmed) {
            try {
                const response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${request.code}/cancel`,
                    { "userCode": user.code },
                    {
                        headers: {
                            'Content-type': 'application/json',
                        }
                    })
                if (response.status === 200) {
                    Swal.fire(
                        "Success",
                        "the request has been cancelled .",
                        'success'
                    );
                    refetch()
                }
            } catch (error) {
                Swal.fire(
                    'Error!',
                    error.response?.data || 'Failed to cancel  the request .',
                    'error'
                );
            }
        }
    }

    const openRequesDetailsModal = async (request) => {
        const articles = await fetchArticle(request.code);
        setArticles(articles);
        setSelectedRequest(request);
        setIsRequestDetailsModalOpen(true);
    }

    const openSupplierSelectionModal = (request) => {
        setSelectedRequest(request);
        setIsSupplierSelectiomModalOpen(true);
    };

    return (
        <div className={!user.roles.includes('A') ? "p-4 bg-gray-100 min-h-screen" : "p-4 sm:ml-64 bg-gray-100 min-h-screen"}>
            <div className=" p-4 border-2 border-gray rounded-lg bg-white" style={{ marginTop: 100 }}>
                <div className="flex flex-col ">
                    <div className="overflow-x-auto">
                        <div className="min-w-full inline-block align-middle">
                            <div className='flex justify-between mb-4'>
                                <div className="flex space-x-4">
                                    <div className="relative text-gray-500 focus-within:text-gray-900">
                                        <div className="absolute inset-y-0 left-1 flex items-center pl-3 pointer-events-none ">
                                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.5 17.5L15.4167 15.4167M15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 
                                                2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333C11.0005 15.8333 12.6614 15.0929 13.8667 
                                                13.8947C15.0814 12.6872 15.8333 11.0147 15.8333 9.16667Z" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="default-search"
                                            className="block w-80 h-11 pr-5 pl-12 py-2.5 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none"
                                            placeholder="Search"
                                        /*value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}*/
                                        />
                                    </div>
                                    {/* <div>
                                        <label htmlFor="department" className="sr-only">Department</label>
                                        <select
                                            id="department"
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            className="block w-48 h-11 px-4 py-2.5 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none"
                                        >
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div> */}
                                    {/* <div>
                                        <label htmlFor="role" className="sr-only">Role</label>
                                        <select
                                            id="role"
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="block w-48 h-11 px-4 py-2.5 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none"
                                        >
                                            <option value={'All'}>All</option>
                                            <option value={'A'}>Admin</option>
                                            <option value={'P'}>Purchaser</option>
                                            <option value={'D'}>Requesteur</option>
                                            <option value={'V'}>Validator</option>
                                        </select>
                                    </div> */}
                                </div>
                                {!user.roles.includes("V") &&
                                    <button
                                        onClick={openCreatRequestModal}
                                        disabled={loading}
                                        type="button"
                                        className="flex flex-row items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                    >{loading ? (
                                        <div role="status">
                                            <svg aria-hidden="true" className="inline w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                            </svg>
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="mr-3">Add Purchase order</span>
                                            <IoMdAdd size={20} />
                                        </>
                                    )}</button>}
                            </div>
                            {isLoading ? (
                                <div className="text-center h-20">
                                    <div role="status">
                                        <svg aria-hidden="true" className="inline w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-hidden">
                                    <table className="min-w-full rounded-xl">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl"> Code </th>
                                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Requestor </th>
                                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Requested At </th>
                                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Status </th>
                                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl"> Actions </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-300">
                                            {requests.items.map(request => (
                                                <tr key={user.code} className="bg-white transition-all duration-500 hover:bg-gray-50">
                                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 "> {request.code}</td>
                                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {request.demandeur.firstName} {request.demandeur.lastName}</td>
                                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {new Date(request.openedAt).toLocaleString('fr-FR')}</td>
                                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                                                        {
                                                            request.status === 0 ? <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">Created</span> :
                                                                request.status === 1 ? <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">Done</span> :
                                                                    request.status === 2 ? <span className="bg-yellow-100 text-yello-800 text-sm font-medium px-3 py-1 rounded-full">Waiting offer</span> :
                                                                        request.status === 3 ? <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">Cancelled</span> :
                                                                            request.status === 4 ? <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">Validated</span> :
                                                                                request.status === 5 ? <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">Rejected</span> : ''
                                                        }
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => openRequesDetailsModal(request)}
                                                                title="Show Request Details"
                                                                className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                                                            >
                                                                <FaEye size={22} color="#4A90E2" className="group-hover:scale-110 transition-transform" />
                                                            </button>
                                                            <button
                                                                onClick={() => openRequestHistoryModal(request)}
                                                                title="Request History"
                                                                className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                                                            >
                                                                <FaClockRotateLeft size={18} color="#A0AEC0" className="group-hover:scale-110 transition-transform" />
                                                            </button>
                                                            {((request.demandeur.code === user.code) || (user.roles.includes('P') && request.status === 2)) && (
                                                                <>
                                                                    <button
                                                                        onClick={() => openUpdateRequestModal(request)}
                                                                        title="Edit Request"
                                                                        className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                                                                    >
                                                                        <PiPencilSimpleLine size={24} color="#1A202C" className="group-hover:scale-110 transition-transform" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => cancelRequest(request)}
                                                                        title="Cancel Request"
                                                                        className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                                                                    >
                                                                        <FaCircleXmark size={20} color="#E53E3E" className="group-hover:scale-110 transition-transform" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {user.roles.includes('P') && (request.status === 0 || request.status === 2) && (
                                                                <button
                                                                    onClick={() => openSupplierSelectionModal(request)}
                                                                    title="Send Request"
                                                                    className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                                                                >
                                                                    <FiSend size={20} color="#5c5c5c" className="group-hover:scale-110 transition-transform" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => navigate(`${request.code}/offers`)}
                                                                title="Add Offers"
                                                                className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                                                            >
                                                                <FaFileCirclePlus size={20} color="#5c5c5c" className="group-hover:scale-110 transition-transform" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ShowArticles
                isOpen={isRequestDetailsModalOpen}
                request={selectedRequest}
                onRequestClose={() => setIsRequestDetailsModalOpen(false)}
                articles={articles}
            />
            <RequestHistory
                history={selectedRequestHistory}
                onRequestClose={()=> setIsRequestHistoryModalOpen(false)}
                isOpen={isRequestHistoryModalOpen}
            />
            <RequestModal
                isOpen={isRequestModalOpen}
                onRequestClose={() => setIsRequestModalOpen(false)}
                code={code}
                request={selectedRequest}
                articles={articles}
                mode={modalMode}
            />
            <SupplierSelectionModal
                isOpen={isSupplierSelectiomModalOpen}
                onRequestClose={() => setIsSupplierSelectiomModalOpen(false)}
                request={selectedRequest}
            />
        </div>
    )
}
export default RequestList