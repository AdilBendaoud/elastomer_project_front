import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DataGrid, { textEditor } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import axios from 'axios';
import Swal from 'sweetalert2';

const OffersPage = () => {
    let { requestCode } = useParams();
    const [suppliers, setSuppliers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const [error, setError] = useState('');

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

    useEffect(() => {
        fetchArticles();
        fetchSuppliers();
    }, [requestCode, fetchArticles, fetchSuppliers]);

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
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Devis`, transformedData    )
            if (response.status === 200) {
                Swal.fire(
                    "Success",
                    "Offer saved successfully !",
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
            key: 'article', name: "Article", children: [
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

    return (
        <div className="py-9 px-14 bg-gray-100 min-h-screen">
            <div className="px-6 py-4 border-2 border-gray rounded-lg bg-white" style={{ marginTop: 100 }}>
                <h1 className="text-2xl font-bold mb-4">Articles and Providers</h1>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    onRowsChange={handleRowsChange}
                    className="rdg-light text-center"
                />
                <div className='flex items-center justify-center'>

                    <button
                        onClick={() => submitData()}
                        className="w-36 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                    >{loadingButton ? (
                        <div role="status">
                            <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    ) : (
                        'Save Data'
                    )}</button>
                </div>
            </div>
        </div>
    );
};
export default OffersPage;