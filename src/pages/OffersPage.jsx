import React, { useCallback, useEffect, useState } from 'react';
import { PiPencilSimpleLine } from 'react-icons/pi';
import { useParams } from 'react-router-dom';
import EditOffers from '../components/EditOffers';

const OffersPage = () => {
    let { requestCode } = useParams();
    const [isEditOfferModalOpen, setIsEditOfferModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
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

    const openEditOffers = (supplier) => {
        setSelectedSupplier(supplier);
        setIsEditOfferModalOpen(true);
    };

    useEffect(() => {
        fetchArticles();
        fetchSuppliers();
    }, [requestCode, fetchArticles, fetchSuppliers]);

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
            <div className="px-6 py-4 border-2 border-gray rounded-lg bg-white" style={{ marginTop: 100 }}>
                <h1 className="text-2xl font-bold mb-4">Articles and Providers</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border text-center">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border" colSpan="3">Articles</th>
                                {suppliers.map((supplier, index) => (
                                    <th className="px-4 py-2 border text-center gap-2" colSpan="3" key={index}>
                                        <span>{supplier.nom}</span>
                                        <button onClick={() => openEditOffers(supplier)}>
                                            <PiPencilSimpleLine size={24} color="#1A202C" className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th className="px-4 py-2 border">Name</th>
                                <th className="px-4 py-2 border">Description</th>
                                <th className="px-4 py-2 border">Quantity</th>
                                {suppliers.map((_, index) => (
                                    <React.Fragment key={index}>
                                        <th className="px-4 py-2 border">Unit Price</th>
                                        <th className="px-4 py-2 border">Quantity</th>
                                        <th className="px-4 py-2 border">Delay</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="px-4 py-2 border">{article.name}</td>
                                    <td className="hideScrollBar p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 border" style={{ maxWidth: '300px', overflowX: 'auto' }}>
                                        <div style={{ whiteSpace: 'nowrap' }}>{article.description}</div>
                                    </td>
                                    <td className="px-4 py-2 border">{article.quantity}</td>
                                    {suppliers.map((supplier) => {
                                        const offer = supplier.offer?.find(o => o.demandeArticleId === article.id);
                                        if (!offer) {
                                            return (
                                                <React.Fragment key={supplier.id}>
                                                    <td className="px-4 py-2 border">-</td>
                                                    <td className="px-4 py-2 border">-</td>
                                                    <td className="px-4 py-2 border">-</td>
                                                </React.Fragment>
                                            );
                                        }
                                        return (
                                            <React.Fragment key={supplier.id}>
                                                <td className="px-4 py-2 border">{offer.unitPrice}</td>
                                                <td className="px-4 py-2 border">{offer.quantity}</td>
                                                <td className="px-4 py-2 border">{offer.delay}</td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="px-4 py-2 border font-bold text-right" colSpan="3">Total</td>
                                {suppliers.map((supplier, index) => (
                                    <React.Fragment key={index}>
                                        <td colSpan={3} className="text-center px-4 py-2 border font-bold">$5000</td>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <EditOffers
                isOpen={isEditOfferModalOpen}
                onRequestClose={() => setIsEditOfferModalOpen(false)}
                articles={articles}
                provider={selectedSupplier}
            />
        </div>
    );
};

export default OffersPage;
