import React, { useState } from 'react'
import { IoMdAdd } from 'react-icons/io'
import { useAuth } from '../context/authContext';
import RequestCreationModal from '../components/RequestCreationModal';
import axios from 'axios';
import swal from 'sweetalert';
import { useQuery } from 'react-query';
import { FaHistory, FaEdit } from 'react-icons/fa';
import UpdateRequestModal from '../components/UpdateRequestModal';
import RequestHistory from '../components/RequestHistory';

const fetchAllUsers = async (code, pageNumber, pageSize,) => {
    let url = `${process.env.REACT_APP_API_ENDPOINT}/Demande?code=${code}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

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
        return response.data.$values;
    } catch (error) {
        console.error(error);
    }
}

const fetchHistory = async (demandeCode) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${demandeCode}/history`)
        return response.data.$values;
    } catch (error) {
        console.error(error);
    }
}

function RequestList() {
    const [isAddRequestModalOpen, setIsAddRequestModalOpen] = useState(false);
    const [isUpdateRequestModalOpen, setIsUpdateRequestModalOpen] = useState(false);
    const [isRequestHistoryModalOpen, setIsRequestHistoryModalOpen] = useState(false);
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
        () => fetchAllUsers(user.code, currentPage, itemsPerPage)
    );

    const closeAddRequestModal = () => setIsAddRequestModalOpen(false);
    const openCreatRequestModal = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/generate-code/${user.code}`)
            setCode(response.data.code);
            setLoading(false)
            setIsAddRequestModalOpen(true);
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

    const openUpdateRequestModal = async (request) => {
        const articles = await fetchArticle(request.code);
        setArticles(articles);
        setSelectedRequest(request);
        setIsUpdateRequestModalOpen(true);
    }
    const closeUpdateRequestModal = () => { setIsUpdateRequestModalOpen(false); }

    const openRequestHistoryModal = async (request) => {
        const history = await fetchHistory(request.code);
        setSelectedRequestHistory(history);
        setIsRequestHistoryModalOpen(true);
    }
    const closeRequestHistoryModal = () => {
        setIsRequestHistoryModalOpen(false);
    }
    return (
        <div className={user.role !== 'A' ? "p-4 bg-gray-100 min-h-screen" : "p-4 sm:ml-64 bg-gray-100 min-h-screen"}>
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
                                <button
                                    onClick={() => openCreatRequestModal(true)}
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
                                )}</button>
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
                                            {requests.items.$values.map(request => (
                                                <tr key={user.code} className="bg-white transition-all duration-500 hover:bg-gray-50">
                                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 "> {request.code}</td>
                                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {request.demandeur.firstName} {request.demandeur.lastName}</td>
                                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {new Date(request.openedAt).toLocaleString('fr-FR')}</td>
                                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {
                                                        request.status === 0 ? 'Created' :
                                                            request.status === 1 ? "Done" :
                                                                request.status === 2 ? "WO" :
                                                                    request.status === 3 ? "Cancel" :
                                                                        request.status === 4 ? "Validated" :
                                                                            request.status === 5 ? "Rejected" : ''
                                                    }
                                                    </td>
                                                    <td className="p-5 ">
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => openUpdateRequestModal(request)} title='Edit Request' className="p-2 rounded-full group transition-all duration-500 flex item-center">
                                                                <FaEdit size={20} color='blue' />
                                                            </button>
                                                            <button onClick={() => openRequestHistoryModal(request)} title='Request History' className="p-2 rounded-full group transition-all duration-500 flex item-center">
                                                                <FaHistory size={20} color='gray' />
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
            <RequestHistory history={selectedRequestHistory} onRequestClose={closeRequestHistoryModal} isOpen={isRequestHistoryModalOpen} />
            <RequestCreationModal code={code} isOpen={isAddRequestModalOpen} onRequestClose={closeAddRequestModal} />
            <UpdateRequestModal articles={articles} request={selectedRequest} isOpen={isUpdateRequestModalOpen} onRequestClose={closeUpdateRequestModal} />
        </div>
    )
}
export default RequestList