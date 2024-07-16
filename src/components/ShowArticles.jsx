import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
Modal.setAppElement('#root');

const ShowArticles = ({ isOpen, onRequestClose, articles, request }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const formattedArticles = articles.map((item, index) => ({
            id: index,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            destination : item.destination,
            familleDeProduit : item.familleDeProduit
        }));
        setItems(formattedArticles);
    }, [articles]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Create Request"
            className="z-50 bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto mt-20"
            overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start"
        >
            <h2 className="text-2xl font-bold mb-4">{request?.code}</h2>
            <div className="mb-8" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table className="min-w-full rounded-xl">
                    <thead>
                        <tr className="bg-gray-50">
                            <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl">Name</th>
                            <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize">Description</th>
                            <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize">Product Family</th>
                            <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize">Destination</th>
                            <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize">Quantity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {items.map((item, index) => (
                            <tr key={index} className="bg-white transition-all duration-500 hover:bg-gray-50">
                                <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">{item.name}</td>
                                <td className="hideScrollBar p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900" style={{ maxWidth: '300px', overflowX: 'auto'}}>
                                    <div style={{ whiteSpace: 'nowrap' }}>{item.description}</div>
                                </td>
                                <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">{item.familleDeProduit}</td>
                                <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">{item.destination}</td>
                                <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};

export default ShowArticles;