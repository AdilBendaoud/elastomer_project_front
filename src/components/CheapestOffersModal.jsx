import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const CheapestOffersModal = ({ isOpen, onClose }) => {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [offers, setOffers] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionType, setSuggestionType] = useState('');
    const [showSection, setShowSection] = useState(false);

    const fetchCheapestOffers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/cheapest-offers`, {
                params: {
                    "name": productName,
                    "description": productDescription
                }
            });
            const exchangeRates = await getExchangeRates();
            const convertedData = response?.data.map(item => {
                return {
                    ...item,
                    "unitPrice": convertPriceToEUR(item.unitPrice, item.devise, exchangeRates).toFixed(2),
                }
            })
            setShowSection(true);
            setOffers(convertedData);
        } catch (error) {
            console.error('Error fetching offers:', error);
            setShowSection(true);
        }
    };

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

    const handleSubmit = () => {
        fetchCheapestOffers();
    };

    const fetchSuggestions = async (query, type) => {
        if (!query) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/products-suggestions`, {
                params: { query, type }
            });
            setSuggestionType(type);
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleInputChange = (setter, type) => (e) => {
        const value = e.target.value;
        setter(value);
        fetchSuggestions(value, type);
    };

    const closeModal = () => {
        setProductDescription('');
        setProductName('');
        setSuggestions([]);
        setSuggestionType('');
        setOffers([]);
        onClose();
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Create User"
            className="z-50 bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto mt-10"
            overlayClassName="z-50 fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start"
        >
            <div style={{ width: 720 }}>
                <h2 className="text-xl font-bold mb-4">Find Cheapest Offers</h2>
                <div className='flex flex-row mb-8 items-end'>
                    <div className="mr-4 w-1/4">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Product Name</label>
                        <input
                            type="text"
                            id="name"
                            value={productName}
                            onChange={handleInputChange(setProductName, "article")}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        {suggestions.length > 0 && suggestionType === "article" && (
                            <ul className="absolute z-50 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => { setProductName(suggestion.nom); setProductDescription(suggestion.description); setSuggestions([]); }}
                                    >
                                        <div className="font-semibold">{suggestion.nom}</div>
                                        <div className="text-sm text-gray-600">{suggestion.description}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="mr-4 w-2/4">
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Product Description</label>
                        <input
                            type="text"
                            id="description"
                            value={productDescription}
                            onChange={handleInputChange(setProductDescription, "description")}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        {suggestions.length > 0 && suggestionType === "description" && (
                            <ul className="absolute z-50 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => { setProductName(suggestion.nom); setProductDescription(suggestion.description); setSuggestions([]); }}
                                    >
                                        <div className="font-semibold">{suggestion.description}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        style={{ height: 50, width: 150 }}
                        onClick={handleSubmit}
                        className="px-4 py-2 w-1/4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                    >
                        Search Offers
                    </button>
                </div>
                {showSection &&
                    <div className='max-h-96 overflow-y-auto'>
                        {offers.length === 0 && <p className='text-lg text-red-500 font-semibold text-center'>No offers found for this product !</p>}
                        {offers.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Top 10 Cheapest Offers</h3>
                                <table className="table w-full border">
                                    <tr>
                                        <th className='px-4 py-2 text-left bg-gray-100 border'>Request Code</th>
                                        <th className='px-4 py-2 text-left bg-gray-100 border'>Supplier</th>
                                        <th className='px-4 py-2 text-left bg-gray-100 border'>Price In €</th>
                                    </tr>
                                    {offers.map((offer, index) => (
                                        <tr>
                                            <td className='px-4 py-2 text-left border'>{offer.request}</td>
                                            <td className='px-4 py-2 text-left border'>{offer.supplierName}</td>
                                            <td className='px-4 py-2 text-left border'>{offer.unitPrice}</td>
                                        </tr>
                                    ))}
                                </table>
                            </div>
                        )}
                    </div>
                }
            </div>
        </Modal>
    );
};

export default CheapestOffersModal;
