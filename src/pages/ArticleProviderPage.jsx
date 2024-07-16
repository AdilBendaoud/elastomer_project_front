import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ArticleProviderPage = () => {
    let { requestCode } = useParams();
    const [offers, setOffers] = useState([]);
    const [articles , setArticles] = useState([]);
    const [error, setError] = useState('');

    const fetchOffers = useCallback(async () => {
        if (requestCode) {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/Offers`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error('Request failed');
                    }
                setOffers(data);
                setError('');
            } catch (error) {
                console.error('Error fetching data:', error);
                setArticles([]);
                setOffers([]);
                setError('Invalid demandeCode. Please try again.');
            }
        }
    }, [requestCode]);
    
    const fethArticles = useCallback(async () => {
        if (requestCode) {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${requestCode}/articles`);
                
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                const data = await response.json();
                setArticles(data);
                setError('');
            } catch (error) {
                console.error('Error fetching data:', error);
                setArticles([]);
                setOffers([]);
                setError('Invalid demandeCode. Please try again.');
            }
        }
    }, [requestCode]);

    useEffect(()=>{
        fethArticles(requestCode);
        fetchOffers(requestCode);
    },[requestCode])

    if(error !== ''){
        return (
            <div className='h-screen flex items-center justify-center'>
                <h1 className='text-red-600 font-bold text-2xl'>{error}</h1>
            </div>
        )
    }
    return (
        <div className="py-9 px-14 bg-gray-100 min-h-screen">
            <div className=" px-6 py-4 border-2 border-gray rounded-lg bg-white" style={{ marginTop: 100 }}>
                <h1 className="text-2xl font-bold mb-4">Articles and Providers</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border text-center">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border" colSpan="3">Articles</th>
                                {offers.map((provider, index) => (
                                    <th className="px-4 py-2 border text-center" colSpan="3" key={index}>
                                        {provider.nom}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th className="px-4 py-2 border">Name</th>
                                <th className="px-4 py-2 border">Description</th>
                                <th className="px-4 py-2 border">Quantity</th>
                                {offers.map((_, index) => (
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
                                    {offers.map((provider, colIndex) => (
                                        <React.Fragment key={colIndex}>
                                            <td className="px-4 py-2 border">{offers[rowIndex]?.prix || '-'}</td>
                                            <td className="px-4 py-2 border">{offers[rowIndex]?.quantity || '-'}</td>
                                            <td className="px-4 py-2 border">{offers[rowIndex]?.DateReception || '-'}</td>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="px-4 py-2 border font-bold text-right" colSpan="3">Total</td>
                                {offers.map((provider, index) => (
                                    <React.Fragment key={index}>
                                        <td colSpan={3} className="text-center px-4 py-2 border font-bold"> $5000 </td>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ArticleProviderPage;