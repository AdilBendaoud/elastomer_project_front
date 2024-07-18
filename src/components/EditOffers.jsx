import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';

Modal.setAppElement('#root');

function EditOffers({ isOpen, onRequestClose, articles, provider }) {
    const [loading, setLoading] = useState(false);
    const [offers, setOffers] = useState([]);

    const handleInputChange = (articleId, field, value) => {
        setOffers((prevOffers) => {
            const existingOfferIndex = prevOffers.findIndex((offer) => offer.demandeArticleId === articleId);

            if (existingOfferIndex !== -1) {
                const updatedOffers = [...prevOffers];
                updatedOffers[existingOfferIndex] = {
                    ...updatedOffers[existingOfferIndex],
                    [field]: value,
                };
                return updatedOffers;
            } else {
                return [
                    ...prevOffers,
                    {
                        demandeArticleId: articleId,
                        [field]: value,
                    },
                ];
            }
        });
    };

    useEffect(() => {
        setOffers(provider.offer || []);
    }, [provider]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Devis`, {
                "supplierId": provider?.id,
                "items": offers
            })
            if (response.status === 200) {
                Swal.fire(
                    "Success",
                    "Offer saved successfully !",
                    'success'
                );
                setLoading(false);
                closeModal();
            }
        } catch (error) {
            Swal.fire("Error", error.message, 'error');
            setLoading(false);
        }
    };

    const closeModal = () => {
        setOffers(provider.offer || []);
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Create Request"
            className="z-50 bg-white p-6 py-8 shadow-lg max-w-lg mt-5 w-full mx-auto overflow-auto hideScrollBar"
            overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start"
        >
            <div style={{ maxHeight: '85vh' }}>
                <h2 className="text-xl font-bold mb-4">Add Offers from {provider?.nom}</h2>
                <form onSubmit={handleSubmit}>
                    {articles.map((article) => {
                        const offer = offers?.find(o => o.demandeArticleId === article.id) || {};
                        return (
                            <div key={article.id} className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">{article.name}</h3>
                                <div className="mb-2 flex">
                                    <div className='w-3/4'>
                                        <label className="block mb-1 font-semibold">Unit Price</label>
                                        <input
                                            type="number"
                                            value={offer.unitPrice || ''}
                                            onChange={(e) => handleInputChange(article.id, 'unitPrice', +e.target.value)}
                                            className="border rounded px-4 py-2 w-full"
                                        />
                                    </div>
                                    <div className='w-1/4 ml-2'>
                                        <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900">Select a Currency</label>
                                        <select
                                            id="role"
                                            name='role'
                                            value={offer.devise || ''}
                                            onChange={(e) => handleInputChange(article.id, 'devise', e.target.value)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        >
                                            <option value="" disabled>Choose currency</option>
                                            <option value="MAD">MAD</option>
                                            <option value="EUR">EURO</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="block mb-1 font-semibold">Quantity</label>
                                    <input
                                        type="number"
                                        value={offer.quantity || ''}
                                        onChange={(e) => handleInputChange(article.id, 'quantity', +e.target.value)}
                                        className="border rounded px-4 py-2 w-full"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block mb-1 font-semibold">Delay</label>
                                    <input
                                        value={offer.delay || ''}
                                        onChange={(e) => handleInputChange(article.id, 'delay', e.target.value)}
                                        type="date"
                                        className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 px-4 py-2 w-full"
                                        placeholder="Select date"
                                    />
                                </div>
                            </div>
                        )
                    })}
                    <div className="flex justify-end mb-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="mr-4 px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >{loading ? (
                            <div role="status">
                                <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        ) : (
                            'Save offer'
                        )}</button>
                    </div>
                </form>
            </div>
        </Modal>
    )
}

export default EditOffers;
