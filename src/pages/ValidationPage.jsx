import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import DataGrid, { textEditor } from 'react-data-grid';
import { useAuth } from '../context/authContext';
import { FaArrowLeftLong } from "react-icons/fa6";
import Swal from 'sweetalert2';
import axios from 'axios';

function ValidationPage() {
    const { user } = useAuth()
    let { requestCode } = useParams();
    const navigate = useNavigate();
    const [supplier, setSupplier] = useState([]);
    const [articles, setArticles] = useState([]);
    const [request, setRequest] = useState(null);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validationLoading, setValidationLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const [error, setError] = useState('');

    const fetchSuppliers = useCallback(async () => {
        if (requestCode) {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/Suppliers/selected-supplier/${requestCode}`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                setSupplier(data);
                setError('');
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setArticles([]);
                setSupplier([]);
                setError('Invalid demandeCode. Please try again.');
                setLoading(false);
            }
        }
    }, [requestCode]);

    const fetchArticles = useCallback(async () => {
        if (requestCode) {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/articles`);
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                const data = await response.json();
                setArticles(data);
                setError('');
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setArticles([]);
                setSupplier([]);
                setError('Invalid demandeCode. Please try again.');
                setLoading(false);
            }
        }
    }, [requestCode]);

    const fetchRequest = useCallback(async () => {
        if (requestCode) {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}`);
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                const data = await response.json();
                setRequest(data);
                setError('');
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setArticles([]);
                setSupplier([]);
                setError('Invalid demandeCode. Please try again.');
                setLoading(false);
            }
        }
    }, [requestCode]);

    useEffect(() => {
        fetchArticles();
        fetchSuppliers();
        fetchRequest()
    }, [requestCode, fetchArticles, fetchSuppliers, fetchRequest]);

    const staticColumns = [
        {
            key: 'article', name: `${requestCode}`, children: [
                { key: 'name', name: 'Name', frozen: true, width: 150, resizable: true },
                { key: 'description', name: 'Description', width: 150, resizable: true },
                { key: 'quantity', name: 'Quantity', width: 100 },
            ]
        },
        {
            name: supplier.nom,
            children: [
                { key: 'unitPrice', name: 'Unit Price' },
                { key: 'quantityOffer', name: 'Quantity' },
                { key: 'delay', name: 'Delay' },
            ]
        },
    ]

    const columns = [
        {
            key: 'Article', name: `${requestCode}`, children: [
                { key: 'name', name: 'Name', frozen: true, width: 150, resizable: true },
                { key: 'description', name: 'Description', width: 150, resizable: true },
                { key: 'quantity', name: 'Quantity', width: 100 },
            ]
        },
        {
            name: supplier.nom,
            children: [
                { key: 'unitPrice', name: 'Unit Price' },
                { key: 'quantityOffer', name: 'Quantity' },
                { key: 'delay', name: 'Delay' },
            ]
        }, {
            key: 'purchaseOrder', name: 'Purchase Order', renderEditCell: textEditor, editable: true
        }
    ]

    const rows = articles.map(article => {
        var rowOffer = {};
        const currentOffer = supplier.offers?.find(o => o.demandeArticleId === article.id);
        if (currentOffer) {
            rowOffer = {
                'unitPrice': currentOffer.unitPrice,
                'quantityOffer': currentOffer.quantity,
                'delay': currentOffer.delay,
            }
        }
        const row = { ...article, ...rowOffer };
        return row;
    });

    const validateRequest = async (request) => {
        const confirmed = await Swal.fire({
            title: "Validate Request",
            text: "Are you sure you want to validate the request ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: "Yes"
        });

        if (confirmed.isConfirmed) {
            try {
                setValidationLoading(true);
                const response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${request.code}/validate/${user.code}`)
                if (response.status === 200) {
                    Swal.fire(
                        "Success",
                        "the request has been validated .",
                        'success'
                    );
                    setValidationLoading(false);
                    window.location.reload();
                }
            } catch (error) {
                Swal.fire(
                    'Error!',
                    error.response?.data || 'Failed to validate  the request .',
                    'error'
                );
                setValidationLoading(false);
            }
        }
    }
    const rejectRequest = async (request) => {
        const confirmed = await Swal.fire({
            title: "Reject Request",
            text: "Are you sure you want to reject the request ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: "Yes"
        });

        if (confirmed.isConfirmed) {
            try {
                setRejectLoading(true);
                const response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${request.code}/reject/${user.code}`)
                if (response.status === 200) {
                    Swal.fire(
                        "Success",
                        "the request has been rejected .",
                        'success'
                    );
                    setRejectLoading(false);
                    window.location.reload();
                }
            } catch (error) {
                Swal.fire(
                    'Error!',
                    error.response?.data || 'Failed to reject the request .',
                    'error'
                );
                setRejectLoading(false);
            }
        }
    }

    const handleFill = ({ columnKey, sourceRow, targetRows }) => {
        if (columnKey !== 'purchaseOrder') return;
        const updatedPurchaseOrders = { ...purchaseOrders };
        targetRows.forEach(row => {
            updatedPurchaseOrders[row.id] = sourceRow.purchaseOrder;
        });
        setPurchaseOrders(updatedPurchaseOrders);
        const updatedArticles = [...articles];
        targetRows.forEach(row => {
            const articleIndex = articles.findIndex(article => article.id === row.id);
            if (articleIndex !== -1) {
                updatedArticles[articleIndex].purchaseOrder = sourceRow.purchaseOrder;
            }
        });
        setArticles(updatedArticles);
    };

    const submitData = async () => {
        var data = articles.map(article => ({ "id": article.id, "purchaseOrder": article.purchaseOrder }));
        try {
            setLoadingButton(true);
            var response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/add-purchase-order`, data);
            if (response.status === 200) {
                Swal.fire(
                    "Success",
                    "the request has been saved .",
                    'success'
                );
                setLoadingButton(false);
            }
        } catch (error) {
            Swal.fire(
                'Error!',
                error.response?.data || 'Failed to save  the request .',
                'error'
            );
            setValidationLoading(false);
        }
    }


    if (error !== '') {
        return (
            <div className='h-screen flex items-center justify-center'>
                <h1 className='text-red-600 font-bold text-2xl'>{error}</h1>
            </div>
        );
    }

    if (loading) {
        return (
            <div className='h-screen flex items-center justify-center'>
                <div
                    className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="py-9 px-14 bg-gray-100 min-h-screen">
            <div className="px-6 py-4 border-2 border-gray-300 rounded-lg bg-white mt-24">
                <div className='flex align-center justify-between mb-3'>
                    <button
                        onClick={() => navigate("/")}
                        type="button"
                        className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 mb-4 flex items-center"
                    >
                        <FaArrowLeftLong size={22} />
                        <span className="ml-2">Back</span>
                    </button>
                    <button
                        onClick={submitData}
                        type="button"
                        className="text-white bg-blue-500 border border-blue-600 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-4"
                        disabled={loadingButton}
                    >
                        <span>
                            {loadingButton ? 'Saving...' : 'Save'}
                        </span>
                    </button>
                </div>
                <DataGrid
                    style={{ height: (rows.length + 2) * 40 + 'px' }}
                    columns={(user.roles.includes('P') && request?.status === 4) ? columns : staticColumns}
                    rows={rows}
                    className="rdg-light text-center"
                    onRowsChange={(updatedRows) => {
                        const newArticles = [...articles];
                        updatedRows.forEach((row, idx) => {
                            newArticles[idx] = {
                                ...articles[idx],
                                purchaseOrder: row.purchaseOrder
                            };
                        });
                        setArticles(newArticles);
                        console.log(newArticles);
                    }}
                    fillHandle={{ onFill: handleFill }}
                />
                {((user?.departement === 'COO' && (request?.status === 8 || request?.status === 6))
                    || (user?.departement === 'CFO' && (request?.status === 7 || request?.status === 6))) && (
                        <div className='bg-white flex items-center justify-center'>
                            <button
                                onClick={() => validateRequest(request)}
                                type="button"
                                class="mr-7 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 me-2 mb-2">
                                {validationLoading ? (
                                    <div role="status">
                                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                ) : (
                                    'Validate'
                                )}
                            </button>
                            <button
                                onClick={() => rejectRequest(request)}
                                type="button"
                                class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-3 me-2 mb-2">
                                {rejectLoading ? (
                                    <div role="status">
                                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                ) : (
                                    'Reject'
                                )}
                            </button>
                        </div>
                    )}
            </div>
        </div>
    )
}

export default ValidationPage