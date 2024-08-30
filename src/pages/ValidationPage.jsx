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
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState({});
    const [articles, setArticles] = useState([]);
    const [request, setRequest] = useState(null);
    const [deliveryFeeExists, SetDeliveryFeeExists] = useState(false);
    const [articleWithoutDeliveryFee, setArticleWithoutDeliveryFee] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validationLoading, setValidationLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const [loadingMarkAsDone, setLoadingMarkAsDone] = useState(false);
    const [loadingReOpen, setLoadingReOpen] = useState(false);
    const [COOComment, setCOOComment] = useState('');
    const [CFOComment, setCFOComment] = useState('');
    const [error, setError] = useState('');
    const [comment, setComment] = useState('');
    const [totals, setTotals] = useState([]);

    const getExchangeRates = async () => {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Settings/get-currency-settings`);
        return {
            USD: response.data.usdToEur,
            EUR: 1.0,
            MAD: response.data.madToEur,
            GBP: response.data.gbpToEur
        };
    };

    const convertPriceToEUR = (price, currency, exchangeRates) => {
        return price * exchangeRates[currency];
    };

    const calculateTotals = async (rows, suppliers) => {
        const exchangeRates = await getExchangeRates();
        const data = suppliers.map(supplier => {
            const originalTotal = rows.reduce((sum, row) => {
                const quantity = parseInt(row.quantity, 10) || 0;
                const unitPrice = parseFloat(row[`${supplier.nom}-unitPrice`]) || 0;
                const unitPriceAfterDiscount = row[`${supplier.nom}-discount`] !== "" ? (unitPrice - unitPrice * (parseFloat(row[`${supplier.nom}-discount`]) / 100)) : unitPrice
                return sum + (quantity * unitPriceAfterDiscount);
            }, 0);
            const total = rows.reduce((sum, row) => {
                const quantity = parseInt(row.quantity, 10) || 0;
                const unitPrice = parseFloat(row[`${supplier.nom}-unitPrice`]) || 0;
                const unitPriceInEUR = convertPriceToEUR(unitPrice, supplier.offer.length > 0 ? supplier?.offer[0].devise : 'EUR', exchangeRates);
                const unitPriceAfterDiscount = row[`${supplier.nom}-discount`] !== "" ? (unitPriceInEUR - unitPriceInEUR * (parseFloat(row[`${supplier.nom}-discount`]) / 100)) : unitPriceInEUR
                return sum + (quantity * unitPriceAfterDiscount);
            }, 0);
            return { id: supplier.id, total, originalTotal };
        });
        setTotals(data);
    };

    const fetchSuppliersAndArticles = useCallback(async () => {
        if (requestCode) {
            try {
                setLoading(true);
                const responseArticles = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/articles`);
                if (!responseArticles.ok) {
                    throw new Error('Request failed');
                }
                const dataArticles = await responseArticles.json();
                setArticles(dataArticles);
                setArticleWithoutDeliveryFee(dataArticles.filter(i => i.name !== "Delivery Fee"))
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/suppliers`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                setSuppliers(data);
                const selected = data.find(s => s.isSelectedForValidation);
                var deliveryStatement = deliveryFeeExists;
                data.map((supplier) => {
                    if (supplier.offer.length > 0 && deliveryStatement === false) {
                        const exists = supplier.offer.some((offer) => offer.articleName === "Delivery Fee");
                        SetDeliveryFeeExists(exists);
                        deliveryStatement = exists
                    }
                })
                setSelectedSupplier(selected)
                setError('');
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setArticles([]);
                setSuppliers([]);
                setError('Error fetching data');
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
                setCFOComment(data?.commentCFO);
                setCOOComment(data?.commentCOO);
                setRequest(data);
                setError('');
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setArticles([]);
                setSuppliers([]);
                setError('Invalid demandeCode. Please try again.');
                setLoading(false);
            }
        }
    }, [requestCode]);

    useEffect(() => {
        fetchRequest();
        fetchSuppliersAndArticles();
    }, [requestCode, fetchSuppliersAndArticles, fetchRequest]);

    useEffect(() => {
        calculateTotals(rows, suppliers)
    }, [articles, suppliers])

    const staticColumnsPurchassor = [
        {
            key: 'Article', name: `${requestCode}`, children: [
                { key: 'name', name: 'Name', frozen: true, width: 150, resizable: true },
                { key: 'description', name: 'Description', width: 150, resizable: true },
                { key: 'quantity', name: 'Quantity', width: 100 },
            ]
        },
        {
            name: selectedSupplier?.nom,
            children: [
                { key: 'unitPrice', name: 'Unit Price' },
                { key: 'discount', name: 'Discount' },
                { key: 'totalPrice', name: 'Total Price' },
                { key: 'delay', name: 'Delay', name: 'Delay' },
            ]
        }, {
            key: 'purchaseOrder', name: 'Purchase Order'
        }
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
            name: selectedSupplier?.nom,
            children: [
                { key: 'unitPrice', name: 'Unit Price' },
                { key: 'discount', name: 'Discount' },
                { key: 'totalPrice', name: 'Total Price' },
                { key: 'delay', name: 'Delay', name: 'Delay' },
            ]
        }, {
            key: 'purchaseOrder', name: 'Purchase Order', renderEditCell: textEditor, editable: true
        }
    ]

    const staticColumnsValidator = [
        {
            key: 'article', name: `${requestCode}`, children: [
                { key: 'name', name: 'Name', frozen: true, width: 150, resizable: true },
                { key: 'description', name: 'Description', width: 150, resizable: true },
                { key: 'quantity', name: 'Quantity', width: 100 },
            ]
        },
        ...suppliers.map(suppliers => ({
            name: suppliers.nom,
            children: [
                { key: `${suppliers.nom}-unitPrice`, name: 'Unit Price', cellClass: suppliers.isSelectedForValidation && "bg-green-300 font-medium" },
                { key: `${suppliers.nom}-discount`, name: 'Discount', cellClass: suppliers.isSelectedForValidation && "bg-green-300 font-medium" },
                { key: `${suppliers.nom}-totalPrice`, name: 'Total Price', cellClass: suppliers.isSelectedForValidation && "bg-green-300 font-medium" },
                { key: `${suppliers.nom}-delay`, name: 'Delay', cellClass: suppliers.isSelectedForValidation && "bg-green-300 font-medium" },
            ]
        })),
    ]

    const rowsShort = articles.map(article => {
        const offer = selectedSupplier?.offer?.find(o => o.demandeArticleId === article.id);
        const row = {
            ...article,
            unitPrice: offer ? offer.unitPrice : '',
            discount: offer ? offer.discount : '',
            totalPrice: offer ? offer.unitPrice * article.quantity : '',
            delay: offer ? offer.delay : ''
        };
        return row;
    });

    const rowsShortWithoutDeliveryFee = articleWithoutDeliveryFee.map(article => {
        const offer = selectedSupplier?.offer?.find(o => o.demandeArticleId === article.id);
        const row = {
            ...article,
            unitPrice: offer ? offer.unitPrice : '',
            discount: offer ? offer.discount : '',
            totalPrice: offer ? offer.unitPrice * article.quantity : '',
            delay: offer ? offer.delay : ''
        };
        return row;
    });

    const rows = articles.map(article => {
        const row = {
            ...article,
            ...suppliers.reduce((acc, supplier) => {
                const offer = supplier.offer.find(o => o.demandeArticleId === article.id);
                if (offer) {
                    acc[`${supplier.nom}-unitPrice`] = offer.unitPrice;
                    acc[`${supplier.nom}-discount`] = offer.discount;
                    acc[`${supplier.nom}-totalPrice`] = offer.discount !== null ? (offer.unitPrice - offer.unitPrice * (offer.discount / 100)) * article.quantity : '';
                    acc[`${supplier.nom}-delay`] = offer.delay;
                } else {
                    acc[`${supplier.nom}-unitPrice`] = '';
                    acc[`${supplier.nom}-totalPrice`] = '';
                    acc[`${supplier.nom}-discount`] = '';
                    acc[`${supplier.nom}-delay`] = '';
                }
                return acc;
            }, {})
        };
        return row;
    });

    const rowsWithoutDeliveryFee = articleWithoutDeliveryFee.map(article => {
        const row = {
            ...article,
            ...suppliers.reduce((acc, supplier) => {
                const offer = supplier.offer.find(o => o.demandeArticleId === article.id);
                if (offer) {
                    acc[`${supplier.nom}-unitPrice`] = offer.unitPrice;
                    acc[`${supplier.nom}-discount`] = offer.discount;
                    acc[`${supplier.nom}-totalPrice`] = offer.discount !== null ? (offer.unitPrice - offer.unitPrice * (offer.discount / 100)) * article.quantity : '';
                    acc[`${supplier.nom}-delay`] = offer.delay;
                } else {
                    acc[`${supplier.nom}-unitPrice`] = '';
                    acc[`${supplier.nom}-totalPrice`] = '';
                    acc[`${supplier.nom}-discount`] = '';
                    acc[`${supplier.nom}-delay`] = '';
                }
                return acc;
            }, {})
        };
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

    const submitData = async (showMessages = true) => {
        var data = articles.map(article => ({ "id": article.id, "purchaseOrder": article.purchaseOrder }));
        try {
            if (showMessages) {
                setLoadingButton(true);
            }
            var response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/add-purchase-order/${user?.code}`, data);
            if (response.status === 200 && showMessages) {
                Swal.fire(
                    "Success",
                    "the request has been saved .",
                    'success'
                ).then(() => { window.location.reload() });
                setLoadingButton(false);
            }
        } catch (error) {
            Swal.fire(
                'Error!',
                error.response?.data || 'Failed to save  the request .',
                'error'
            );
            setLoadingButton(false);
        }
    }

    const markAsDone = async () => {
        try {
            await submitData(false);
            setLoadingMarkAsDone(true);
            var response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/done/${user.code}`);
            if (response.status === 200) {
                Swal.fire(
                    "Success",
                    "the request has been marked as done .",
                    'success'
                ).then(() => { window.location.reload() });
                setLoadingMarkAsDone(false);
            }
        } catch (error) {
            Swal.fire(
                'Error!',
                error.response?.data || 'Error occurred .',
                'error'
            );
            setLoadingMarkAsDone(false);
        }
    }

    const addComment = async () => {
        try {
            setLoadingMarkAsDone(true);
            var response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/comment`, {
                "userCode": user?.code,
                "comment": comment
            });
            if (response.status === 200) {
                if (user.departement === 'COO') {
                    setCOOComment(comment)
                } else if (user.departement === 'CFO') {
                    setCFOComment(comment)
                }
                setComment('');
                setLoadingMarkAsDone(false);
            }
        } catch (error) {
            setLoadingMarkAsDone(false);
        }
    }

    const handleOpenForValidation = async () => {
        try {
            setLoadingReOpen(true);
            var response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/set-wv/${user.code}`);
            if (response.status === 200) {
                Swal.fire(
                    "Success",
                    "the request has been reopend for validation .",
                    'success'
                ).then(() => {
                    navigate(`/offers/${requestCode}`)
                });
                setLoadingReOpen(false);
            }
        } catch (error) {
            Swal.fire(
                'Error!',
                error.response?.data || 'Error occurred .',
                'error'
            );
            setLoadingReOpen(false);
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
    console.log(deliveryFeeExists);
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
                    <div>
                        {(request?.status !== 1 && user?.roles.includes("P")) &&
                            <button
                                onClick={markAsDone}
                                type="button"
                                className="text-white bg-green-500 border border-green-600 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-4 mr-3"
                                disabled={loadingMarkAsDone}
                            >
                                <span>
                                    {loadingMarkAsDone ? 'Loading...' : 'Mark As Done'}
                                </span>
                            </button>
                        }
                        {user?.roles.includes("P") && request?.status !== 1 &&
                            <button
                                onClick={() => submitData(true)}
                                type="button"
                                className="text-white bg-blue-500 border border-blue-600 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-4"
                                disabled={loadingButton}
                            >
                                <span>
                                    {loadingButton ? 'Saving...' : 'Save'}
                                </span>
                            </button>
                        }
                        {user?.roles.includes("P") && request?.status === 1 && user.reOpenRequestAfterValidation &&
                            <button
                                onClick={handleOpenForValidation}
                                type="button"
                                className="text-white bg-emerald-500 border border-emerald-600 hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-4"
                                disabled={loadingReOpen}
                            >{loadingReOpen ? (
                                <div role="status">
                                    <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            ) : (
                                'Open Request For Validation'
                            )}
                            </button>
                        }
                    </div>
                </div>
                <DataGrid
                    enableCellSelect={true}
                    style={{ height: (rows.length + 2) * 40 + 'px' }}
                    columns={
                        (user.roles.includes('P') && request?.status === 4) ? columns :
                            (user.roles.includes('P') && request?.status === 1) ? staticColumnsPurchassor :
                                staticColumnsValidator
                    }
                    rows={
                        (user.roles.includes('P') && (request?.status === 4 || request?.status === 1)) ?
                            (deliveryFeeExists ? rowsShort : rowsShortWithoutDeliveryFee) :
                            (deliveryFeeExists ? rows : rowsWithoutDeliveryFee)
                    }
                    className="rdg-light text-center mb-4"
                    onRowsChange={(updatedRows) => {
                        const newArticles = [...articles];
                        updatedRows.forEach((row, idx) => {
                            newArticles[idx] = {
                                ...articles[idx],
                                purchaseOrder: row.purchaseOrder
                            };
                        });
                        setArticles(newArticles);
                    }}
                />
                {request?.status === 7 || request?.status === 6 || request?.status === 8 ?
                    <div className="p-4 bg-white rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Supplier Totals</h2>
                        <div className="space-y-2">
                            {suppliers.map((supplier) => (
                                <div
                                    key={supplier.id}
                                    className={selectedSupplier?.id === supplier.id ?
                                        "flex max-w-2xl items-center space-x-4 p-3 rounded-lg border border-gray-300 shadow-md bg-green-500" :
                                        "flex max-w-2xl items-center space-x-4 p-3 rounded-lg border border-gray-300 shadow-md"}
                                >
                                    <span className="text-lg font-semibold flex-1">
                                        {supplier.nom}
                                    </span>
                                    {(supplier?.offer?.length === 0 || supplier?.offer?.[0]?.devise === 'EUR') ?
                                        <div className="text-md- font-bold">
                                            Total : € {totals?.find((elm) => elm.id === supplier.id)?.total?.toFixed(2) || 'N/A'}
                                        </div>
                                        :
                                        <>
                                            <div className="text-sm">
                                                Total : {supplier?.offer?.[0]?.devise} {totals?.find((elm) => elm.id === supplier.id)?.originalTotal?.toFixed(2) || 'N/A'}
                                            </div>
                                            <div className="text-md font-bold">
                                                Total : € {totals?.find((elm) => elm.id === supplier.id)?.total?.toFixed(2) || 'N/A'}
                                            </div>
                                        </>
                                    }
                                </div>
                            )
                            )}
                        </div>
                    </div>
                    :
                    <div className="p-4 bg-white rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Supplier Total</h2>
                        <div className="space-y-2">
                            <div
                                className="flex max-w-2xl items-center space-x-4 p-3 rounded-lg border border-gray-300 shadow-md"
                            >
                                <span className="text-lg font-semibold flex-1">
                                    {selectedSupplier.nom}
                                </span>
                                {(selectedSupplier?.offer?.length === 0 || selectedSupplier?.offer?.[0]?.devise === 'EUR') ?
                                    <div className="text-md- font-bold">
                                        Total : € {totals?.find((elm) => elm.id === selectedSupplier.id)?.total?.toFixed(2) || 'N/A'}
                                    </div>
                                    :
                                    <>
                                        <div className="text-sm">
                                            Total : {selectedSupplier?.offer?.[0]?.devise} {totals?.find((elm) => elm.id === selectedSupplier.id)?.originalTotal?.toFixed(2) || 'N/A'}
                                        </div>
                                        <div className="text-md font-bold">
                                            Total : € {totals?.find((elm) => elm.id === selectedSupplier.id)?.total?.toFixed(2) || 'N/A'}
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                }

                {
                    (request?.status !== 1 && user?.roles.includes("V")) &&
                    <div className="mt-4 w-3/5">
                        <label className="font-semibold block mb-2">Add/Edit Comment:</label>
                        <textarea
                            className="w-full p-2 border rounded-lg"
                            rows="2"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add your comments here..."
                        />
                        <div className='flex justify-end'>
                            <button
                                onClick={addComment}
                                type="button"
                                className={
                                    comment.trim() === '' ?
                                        "self-end  bg-gray-300 px-4 py-2 rounded-md cursor-not-allowed opacity-50 font-medium rounded-lg text-sm px-5 py-2.5 mb-4" :
                                        "self-end text-white bg-blue-500 border border-blue-600 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-4"
                                }
                                disabled={loadingButton || comment.trim() === ''}
                            >
                                <span>
                                    {loadingButton ? 'Saving...' : 'Save'}
                                </span>
                            </button>
                        </div>
                    </div>
                }
                <div className="mb-4">
                    <label className="font-semibold block mb-2">COO Comment :</label>
                    <div className="p-2 border rounded-lg bg-gray-100">
                        <p>{COOComment !== null ? COOComment : 'No comment yet .'}</p>
                    </div>
                </div>
                <div className="my-4">
                    <label className="font-semibold block mb-2">CFO Comment :</label>
                    <div className="p-2 border rounded-lg bg-gray-100">
                        <p>{CFOComment !== null ? CFOComment : 'No comment yet .'}</p>
                    </div>
                </div>
                {
                    ((user?.departement === 'COO' && (request?.status === 8 || request?.status === 6))
                        || (user?.departement === 'CFO' && (request?.status === 7 || request?.status === 6))) && (
                        <div className='bg-white flex items-center justify-center'>
                            <button
                                onClick={() => validateRequest(request)}
                                type="button"
                                className="mr-7 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 me-2 mb-2">
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
                                className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-3 me-2 mb-2">
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
                    )
                }
            </div >
        </div >
    )
}

export default ValidationPage