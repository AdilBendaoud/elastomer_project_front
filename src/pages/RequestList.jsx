import React, { useState, useEffect } from 'react';
import { IoMdAdd } from 'react-icons/io';
import { useAuth } from '../context/authContext';
import RequestModal from '../components/RequestModal';
import axios from 'axios';
import swal from 'sweetalert';
import Swal from 'sweetalert2';
import { useQuery } from 'react-query';
import { FaEye, FaFile } from 'react-icons/fa';
import { FaCircleXmark, FaFileCircleCheck } from "react-icons/fa6";
import ShowArticles from '../components/ShowArticles';
import { FiSend } from "react-icons/fi";
import SupplierSelectionModal from '../components/SupplierSelectionModal';
import { Link, useNavigate } from "react-router-dom";

const fetchAllRequests = async (code, pageNumber, pageSize, filters, sortBy) => {
    let url = `${process.env.REACT_APP_API_ENDPOINT}/Demande?userCode=${code}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

    if (filters.searchQuery) {
        url += `&search=${encodeURIComponent(filters.searchQuery)}`;
    }
    if (filters.status) {
        url += `&status=${encodeURIComponent(filters.status)}`;
    }
    if (filters.startDate && filters.endDate) {
        url += `&startDate=${encodeURIComponent(filters.startDate)}&endDate=${encodeURIComponent(filters.endDate)}`;
    }
    // if (sortBy.length > 0) {
    //     const sortQuery = sortBy.map(sort => `${sort.id},${sort.desc ? 'desc' : 'asc'}`).join(';');
    //     url += `&sort=${encodeURIComponent(sortQuery)}`;
    // }

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
        }
    });
    return res.json();
};

function RequestList() {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isRequestDetailsModalOpen, setIsRequestDetailsModalOpen] = useState(false);
    const [isSupplierSelectionModalOpen, setIsSupplierSelectionModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [articles, setArticles] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        searchQuery: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [sortBy, setSortBy] = useState([]);

    //const [requests, setRequests] = useState([]);

    const [totalRequests, setTotalRequests] = useState(0);
    const { data: requests, isLoading, refetch, error } = useQuery(
        ["requests", user.code, currentPage, itemsPerPage, filters, sortBy],
        () => fetchAllRequests(user.code, currentPage, itemsPerPage, filters, sortBy)
    );

    const fetchArticle = async (demandeCode) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${demandeCode}/Articles`);
            const data = response.data;
            setArticles(data);
            return data;
        } catch (error) {
            console.error(error);
            swal('Error', 'Failed to fetch article details', 'error');
        }
    }

    const openRequesDetailsModal = (request) => {
        setSelectedRequest(request);
        fetchArticle(request.code);
        setIsRequestDetailsModalOpen(true);
    }

    const openSupplierSelectionModal = (request) => {
        setSelectedRequest(request);
        setIsSupplierSelectionModalOpen(true);
    }

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    };

    const handleStatusChange = (e) => {
        setFilters(prev => ({ ...prev, status: e.target.value }));
    };

    const handleDateRangeChange = (start, end) => {
        setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
    };

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

    const pageCount = Math.ceil(requests?.totalCount / itemsPerPage);

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
        setSelectedRequest(null);
        setIsRequestModalOpen(true);
    }

    return (
        <div className={!user.roles.includes('A') ? "p-4 bg-gray-100 min-h-screen" : "p-4 sm:ml-64 bg-gray-100 min-h-screen"}>
            <div className=" p-4 border-2 border-gray rounded-lg bg-white" style={{ marginTop: 100 }}>
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Requests</h2>
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
                                    <IoMdAdd size={20} />
                                    <span className="mr-3">Create Request</span>
                                </>
                            )}</button>}
                    </div>

                    <div className="mb-4 flex space-x-4">
                        <input
                            type="text"
                            placeholder="Search by Requestor or Code"
                            value={filters.searchQuery}
                            onChange={handleSearchChange}
                            className="p-2 border border-gray-300 rounded w-56"
                        />
                        <select
                            value={filters.status}
                            onChange={handleStatusChange}
                            className="p-2 border border-gray-300 rounded"
                        >
                            <option value="">All Statuses</option>
                            <option value="0">Created</option>
                            <option value="1">Done</option>
                            <option value="2">Waiting offer</option>
                            <option value="3">Cancelled</option>
                            <option value="4">Validated</option>
                            <option value="5">Rejected</option>
                            <option value="6">Waiting for validation</option>
                        </select>
                        <input
                            type="date"
                            placeholder="Start Date"
                            value={filters.startDate}
                            onChange={(e) => handleDateRangeChange(e.target.value, filters.endDate)}
                            className="p-2 border border-gray-300 rounded"
                        />
                        <input
                            type="date"
                            placeholder="End Date"
                            value={filters.endDate}
                            onChange={(e) => handleDateRangeChange(filters.startDate, e.target.value)}
                            className="p-2 border border-gray-300 rounded"
                        />
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
                        <>
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left bg-gray-100 border-b cursor-pointer">Code</th>
                                        <th className="px-4 py-2 text-left bg-gray-100 border-b cursor-pointer">Requestor</th>
                                        <th className="px-4 py-2 text-left bg-gray-100 border-b cursor-pointer">Requested At</th>
                                        <th className="px-4 py-2 text-left bg-gray-100 border-b cursor-pointer">Status</th>
                                        <th className="px-4 py-2 text-left bg-gray-100 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody >
                                    {requests?.items.map((request) => (
                                        <tr key={request.code}>
                                            <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 border-b">{request.code}</td>
                                            <td className="px-4 py-2 border-b">{request.demandeur.firstName} {request.demandeur.lastName}</td>
                                            <td className="px-4 py-2 border-b">{new Date(request.openedAt).toLocaleString('fr-FR')}</td>
                                            <td className="px-4 py-2 border-b">
                                                {
                                                    request.status === 0 ? <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">Created</span> :
                                                        request.status === 1 ? <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">Done</span> :
                                                            request.status === 2 ? <span className="bg-yellow-100 text-yello-800 text-sm font-medium px-3 py-1 rounded-full">Waiting offer</span> :
                                                                request.status === 3 ? <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">Cancelled</span> :
                                                                    request.status === 4 ? <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">Validated</span> :
                                                                        request.status === 5 ? <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">Rejected</span> :
                                                                            request.status === 6 ? <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">Waiting for validation</span> :
                                                                                (request.status === 7 || request.status === 8) ?
                                                                                    <span className="text-sm font-medium px-3 py-1 rounded-full">
                                                                                        <span
                                                                                            className={`${request.status === 7 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-sm font-medium px-3 py-1 rounded-s-full`}
                                                                                        >
                                                                                            COO
                                                                                        </span>
                                                                                        <span className={`${request.status === 8 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-sm font-medium px-3 py-1 rounded-e-full`}>CFO</span>
                                                                                    </span> : ''
                                                }
                                            </td>
                                            <td className="px-5 py-3 border-b">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openRequesDetailsModal(request)}
                                                        title="Show Request Details"
                                                        className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                                                    >
                                                        <FaEye size={22} color="#4A90E2" className="group-hover:scale-110 transition-transform" />
                                                    </button>
                                                    {((request.demandeur.code === user.code && request?.status === 0) || (user.roles.includes('P') && request.status === 2)) && (
                                                        <button
                                                            onClick={() => cancelRequest(request)}
                                                            title="Cancel Request"
                                                            className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                                                        >
                                                            <FaCircleXmark size={20} color="#E53E3E" className="group-hover:scale-110 transition-transform" />
                                                        </button>
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
                                                    {user.roles.includes('P') && (request.status === 5 || request.status === 2 || request.status === 1) && (
                                                        <button
                                                            onClick={() => navigate(`/offers/${request.code}`)}
                                                            title="Offers"
                                                            className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                                                        >
                                                            <FaFile size={20} color="#5c5c5c" className="group-hover:scale-110 transition-transform" />
                                                        </button>)}
                                                    {((user.roles.includes('V')) || (user.roles.includes('P') && (request?.status === 4 || request?.status === 1))) &&
                                                        <button
                                                            onClick={() => navigate(`/offers-validation/${request.code}`)}
                                                            className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                                                            title="Validation">
                                                            <FaFileCircleCheck size={22} color="green" />
                                                        </button>
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="pagination flex justify-between items-center mt-4">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                                >
                                    {'<'}
                                </button>
                                <span>
                                    Page{' '}
                                    <strong>
                                        {currentPage} of {pageCount}
                                    </strong>{' '}
                                </span>
                                <div>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === pageCount}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                                    >
                                        {'>'}
                                    </button>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="p-2 border border-gray-300 rounded ms-5"
                                    >
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                Show {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                    < ShowArticles
                        update={fetchArticle}
                        isOpen={isRequestDetailsModalOpen}
                        request={selectedRequest}
                        onRequestClose={() => setIsRequestDetailsModalOpen(false)}
                        articles={articles}
                    />
                    <RequestModal
                        isOpen={isRequestModalOpen}
                        onRequestClose={() => setIsRequestModalOpen(false)}
                        code={code}
                        request={selectedRequest}
                        articles={articles}
                        mode={'create'}
                    />
                    <SupplierSelectionModal
                        isOpen={isSupplierSelectionModalOpen}
                        onRequestClose={() => setIsSupplierSelectionModalOpen(false)}
                        request={selectedRequest}
                    />
                </div>
            </div>
        </div>
    );
}

export default RequestList;