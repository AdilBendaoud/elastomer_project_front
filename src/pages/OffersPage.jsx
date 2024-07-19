import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DataGrid, { textEditor } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaArrowLeftLong } from "react-icons/fa6";
import { useAuth } from '../context/authContext';

const OffersPage = () => {
    const {user} = useAuth()
    const navigate = useNavigate();
    let { requestCode } = useParams();
    const [suppliers, setSuppliers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const [loadingValidation, setLoadingValidation] = useState(false);
    const [error, setError] = useState('');
    const [selectedSupplierId, setSelectedSupplierId] = useState(null);
    const [bestSupplier, setBestSupplier] = useState(null);

    const fetchSuppliers = useCallback(async () => {
        if (requestCode) {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/suppliers`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                setSuppliers(data);
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
                setSuppliers([]);
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
                setSuppliers([]);
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

    const submitData = async () => {
        try {
            let transformedData = [];

            suppliers.forEach(supplier => {
                const supplierOffers = supplier.offer.map(offer => {
                    const { unitPrice, quantity, delay } = offer;

                    if (unitPrice !== undefined && quantity !== undefined && delay !== undefined) {
                        return {
                            demandeArticleId: offer.demandeArticleId,
                            devise: 'MAD',
                            quantity: parseInt(quantity, 10),
                            unitPrice: parseFloat(unitPrice),
                            delay: parseInt(delay, 10)
                        };
                    }
                    return null;
                }).filter(offer => offer !== null);

                if (supplierOffers.length > 0) {
                    transformedData.push({
                        supplierId: supplier.id,
                        items: supplierOffers
                    });
                }
            });
            setLoadingButton(true);
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Devis`, transformedData)
            if (response.status === 200) {
                Swal.fire(
                    "Success",
                    "Offer saved successfully!",
                    'success'
                );
                setLoadingButton(false);
            }
        } catch (error) {
            Swal.fire("Error", error.message, 'error');
            setLoadingButton(false);
        }
    }

    const handleRowsChange = (updatedRows) => {
        const updatedSuppliers = suppliers.map(supplier => {
            const updatedOffers = updatedRows.map(row => {
                return {
                    demandeArticleId: row.id,
                    unitPrice: row[`${supplier.nom}-unitPrice`],
                    quantity: row[`${supplier.nom}-quantity`],
                    delay: row[`${supplier.nom}-delay`]
                };
            }).filter(offer => offer.demandeArticleId);

            return {
                ...supplier,
                offer: updatedOffers
            };
        });

        setSuppliers(updatedSuppliers);
    };

    const calculateBestSupplier = (rows, suppliers) => {
        let bestSupplier = null;
        let bestScore = Infinity;

        suppliers.forEach(supplier => {
            let totalScore = 0;

            rows.forEach(row => {
                const quantity = parseInt(row[`${supplier.nom}-quantity`], 10) || 0;
                const unitPrice = parseFloat(row[`${supplier.nom}-unitPrice`]) || 0;
                const delay = parseInt(row[`${supplier.nom}-delay`], 10) || 0;

                const requestedQuantity = row.quantity;
                const quantityDiff = Math.abs(requestedQuantity - quantity);
                const score = (quantityDiff * 1000) + (unitPrice * 10) + delay;

                totalScore += score;
            });

            if (totalScore < bestScore) {
                bestScore = totalScore;
                bestSupplier = supplier;
            }
        });

        return bestSupplier;
    };

    useEffect(() => {
        if (articles.length > 0 && suppliers.length > 0) {
            const best = calculateBestSupplier(articles, suppliers);
            setSelectedSupplierId(best?.id || null);
            setBestSupplier(best);
        }
    }, [articles, suppliers]);

    const handleSubmitSelectedOffer = async () => {
        try {
            setLoadingValidation(true);
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Devis/sendForValidation`, {
                "demandeCode": requestCode,
                "supplierId": selectedSupplierId
            });

            if (response.status === 200) {
                Swal.fire({
                    title: "Success",
                    text: "Request sent For Validation!",
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed) {
                        setLoadingValidation(false);
                        window.location.reload();
                    }
                });
            }
        } catch (error) {
            Swal.fire("Error", error.message, 'error');
            setLoadingValidation(false);
        }
    };

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

    const columns = [
        {
            key: 'article', name: `${requestCode}`, children: [
                { key: 'name', name: 'Name', frozen: true, width: 150, resizable: true },
                { key: 'description', name: 'Description', width: 150, resizable: true },
                { key: 'quantity', name: 'Quantity', width: 100 },
            ]
        },
        ...suppliers.map(supplier => ({
            name: supplier.nom,
            children: [
                { key: `${supplier.nom}-unitPrice`, name: 'Unit Price', renderEditCell: textEditor },
                { key: `${supplier.nom}-quantity`, name: 'Quantity', renderEditCell: textEditor },
                { key: `${supplier.nom}-delay`, name: 'Delay', renderEditCell: textEditor },
            ]
        })),
    ];

    const staticColumns = [
        {
            key: 'article', name: `${requestCode}`, children: [
                { key: 'name', name: 'Name', frozen: true, width: 150, resizable: true },
                { key: 'description', name: 'Description', width: 150, resizable: true },
                { key: 'quantity', name: 'Quantity', width: 100 },
            ]
        },
        ...suppliers.map(supplier => ({
            name: supplier.nom,
            children: [
                { key: `${supplier.nom}-unitPrice`, name: 'Unit Price' },
                { key: `${supplier.nom}-quantity`, name: 'Quantity' },
                { key: `${supplier.nom}-delay`, name: 'Delay' },
            ]
        })),
    ]

    const rows = articles.map(article => {
        const row = {
            ...article,
            ...suppliers.reduce((acc, supplier) => {
                const offer = supplier.offer.find(o => o.demandeArticleId === article.id);
                if (offer) {
                    acc[`${supplier.nom}-unitPrice`] = offer.unitPrice;
                    acc[`${supplier.nom}-quantity`] = offer.quantity;
                    acc[`${supplier.nom}-delay`] = offer.delay;
                }
                return acc;
            }, {})
        };
        return row;
    });

    const calculateTotals = (rows, suppliers) => {
        return suppliers.map(supplier => {
            const total = rows.reduce((sum, row) => {
                const quantity = parseInt(row[`${supplier.nom}-quantity`], 10) || 0;
                const unitPrice = parseFloat(row[`${supplier.nom}-unitPrice`]) || 0;
                return sum + (quantity * unitPrice);
            }, 0);
            return { id: supplier.id, total }
        });
    };

    const totals = calculateTotals(rows, suppliers);

    return (
        <div className="py-9 px-14 bg-gray-100 min-h-screen">
            <div className="px-6 py-4 border-2 border-gray-300 rounded-lg bg-white mt-24">
                <button
                    onClick={() => navigate("/")}
                    type="button"
                    className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 mb-4 flex items-center"
                >
                    <FaArrowLeftLong size={22} />
                    <span className="ml-2">Back</span>
                </button>
                <div className="space-y-6">
                    <div className='flex items-center justify-between mb-6'>
                        <h1 className="text-2xl font-bold mb-6">Articles and Providers</h1>
                        {((request?.status === 2 || request?.status === 5) && user.isPurchaser) &&

                            <button
                                onClick={submitData}
                                type="button"
                                className="text-white bg-blue-500 border border-blue-600 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                disabled={loadingButton}
                            >
                                {loadingButton ? 'Saving...' : 'Save Offers'}
                            </button>
                        }
                    </div>
                    <DataGrid
                        style={{ height: (rows.length + 2) * 40 + 'px' }}
                        columns={((request?.status === 2 || request?.status === 5) && user.isPurchaser) ? columns : staticColumns}
                        rows={rows}
                        onRowsChange={handleRowsChange}
                        className="rdg-light text-center"
                    />
                    {((request?.status === 2 || request?.status === 5) && user.isPurchaser) &&
                        <>
                            <div className="p-4 bg-white rounded-lg max-h-64 overflow-y-auto">
                                <h2 className="text-xl font-semibold mb-4">Supplier Totals</h2>
                                <div className="space-y-2">
                                    {suppliers.map((supplier) => (
                                        <div
                                            key={supplier.id}
                                            className={bestSupplier?.id === supplier.id ?
                                                "flex max-w-md  items-center space-x-4 p-3 rounded-lg border border-gray-300 shadow-md bg-green-500" :
                                                "flex max-w-md  items-center space-x-4 p-3 rounded-lg border border-gray-300 shadow-md"}
                                        >
                                            <input
                                                type="radio"
                                                id={`supplier-${supplier.id}`}
                                                name="best-supplier"
                                                value={supplier.id}
                                                checked={selectedSupplierId === supplier.id}
                                                onChange={() => setSelectedSupplierId(supplier.id)}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`supplier-${supplier.id}`} className="text-lg font-semibold flex-1">
                                                {supplier.nom}
                                            </label>
                                            <div className="text-sm">
                                                Total: {totals.find((elm) => elm.id === supplier.id)?.total?.toFixed(2) || 'N/A'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='flex items-center justify-center'>
                                <button
                                    disabled={loadingValidation}
                                    onClick={handleSubmitSelectedOffer}
                                    className='text-white bg-green-500 border border-blue-600 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5'
                                >
                                    {loadingValidation ? 'Sending...' : 'Send To Validation'}
                                </button>
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>
    );
};

export default OffersPage;
