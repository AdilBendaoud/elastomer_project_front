import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { FaClockRotateLeft } from 'react-icons/fa6';
import Modal from 'react-modal';
import RequestHistory from '../components/RequestHistory';
import RequestModal from './RequestModal';
import { useAuth } from '../context/authContext';
import { PiPencilSimpleLine } from 'react-icons/pi';
Modal.setAppElement('#root');

const ShowArticles = ({ isOpen, onRequestClose, articles, request }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [isRequestHistoryModalOpen, setIsRequestHistoryModalOpen] = useState(false);
    const [selectedRequestHistory, setSelectedRequestHistory] = useState(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const fetchHistory = async (demandeCode) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${demandeCode}/history`)
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    const openRequestHistoryModal = async (request) => {
        const history = await fetchHistory(request.code);
        setSelectedRequestHistory(history);
        setIsRequestHistoryModalOpen(true);
    }

    useEffect(() => {
        const formattedArticles = articles.map((item, index) => ({
            id: index,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            destination: item.destination,
            familleDeProduit: item.familleDeProduit
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
                                <td className="hideScrollBar p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900" style={{ maxWidth: '300px', overflowX: 'auto' }}>
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
            <div className='flex items-center justify-center'>
                <button
                    onClick={() => openRequestHistoryModal(request)}
                    title="Request History"
                    className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                >
                    <FaClockRotateLeft size={18} color="#A0AEC0" className="group-hover:scale-110 transition-transform" />
                </button>
                {(( isOpen && request.demandeur?.code === user.code) || ( isOpen && user.roles.includes('P') && request.status === 2)) && (
                    <>
                        <button
                            onClick={() => setIsRequestModalOpen(true)}
                            title="Edit Request"
                            className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200"
                        >
                            <PiPencilSimpleLine size={24} color="#1A202C" className="group-hover:scale-110 transition-transform" />
                        </button>
                    </>
                )}
            </div>
            <RequestHistory
                history={selectedRequestHistory}
                onRequestClose={() => setIsRequestHistoryModalOpen(false)}
                isOpen={isRequestHistoryModalOpen}
            />
            <RequestModal
                isOpen={isRequestModalOpen}
                onRequestClose={() => setIsRequestModalOpen(false)}
                code={request?.code}
                request={request}
                articles={articles}
                mode={'update'}
            />
        </Modal>
    );
};

export default ShowArticles;