import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import Swal from 'sweetalert2';
import { FaXmark } from "react-icons/fa6";
import { IoReload } from "react-icons/io5";

Modal.setAppElement('#root');

const SupplierSelectionModal = ({ isOpen, onRequestClose, request }) => {
    const { token, user } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [previouslySelectedSuppliers, setPreviouslySelectedSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingResend, setLoadingResend] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${request?.code}/suppliers`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const fetchedSuppliers = response.data;
                setSuppliers(fetchedSuppliers);
                setPreviouslySelectedSuppliers(fetchedSuppliers.map(supplier => supplier.nom));
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            }
        };
        if (isOpen) {
            fetchSuppliers();
        }
    }, [isOpen, token, request?.code]);

    const handleSupplierSelect = (supplier) => {
        if (!selectedSuppliers.find(s => s.id === supplier.id)) {
            setSelectedSuppliers([...selectedSuppliers, { id: supplier.id, name: supplier.nom }]);
        }
        setSearchTerm('');
        setSuggestions([]);
    };

    const handleSupplierRemove = (supplierName) => {
        setSelectedSuppliers(selectedSuppliers.filter(supplier => supplier.name !== supplierName));
    };

    const handleSearchChange = async (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value.length > 1) {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/suppliers/search`, {
                    params: {
                        query: e.target.value,
                        requestCode: request?.code
                    }
                });
                setSuggestions(response.data);
            } catch (error) {
                console.error('Error fetching supplier suggestions:', error);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSubmit = async () => {
        const requestCode = request?.code;
        const userCode = user?.code;
        const newSupplierNames = selectedSuppliers.map(supplier => supplier.name);

        try {
            setLoading(true);
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Suppliers/send-to-suppliers`, {
                userCode,
                requestCode,
                supplierNames: newSupplierNames
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                Swal.fire({
                    title: "Success!",
                    text: "Request sent to suppliers successfully!",
                    icon: 'success',
                    timer: 2000
                }).then(closeModal());
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Failed to send request to suppliers!",
                    icon: 'error',
                    timer: 2000
                });
            }
            setLoading(false);
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "An error occurred!",
                icon: 'error',
                timer: 2000
            });
            console.error('Error sending request to suppliers:', error);
            setLoading(false);
        }
    };


    const handleReSend = async () => {
        const requestCode = request?.code;
        const userCode = user?.code;
        const newSupplierNames = selectedSuppliers.map(supplier => supplier.name);

        // Merge the previously selected supplier names with the new supplier names
        const mergedSupplierNames = new Set([...previouslySelectedSuppliers, ...newSupplierNames]);

        try {
            setLoadingResend(true);
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Suppliers/send-to-suppliers`, {
                userCode,
                requestCode,
                supplierNames: Array.from(mergedSupplierNames)
            });

            if (response.status === 200) {
                Swal.fire({
                    title: "Success!",
                    text: "Request sent to suppliers successfully!",
                    icon: 'success',
                    timer: 2000
                }).then(closeModal());
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Failed to send request to suppliers!",
                    icon: 'error',
                    timer: 2000
                });
            }
            setLoadingResend(false);
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "An error occurred!",
                icon: 'error',
                timer: 2000
            });
            console.error('Error sending request to suppliers:', error);
            setLoadingResend(false);
        }
    };


    const closeModal = () => {
        setSuppliers([]);
        setSelectedSuppliers([]);
        setPreviouslySelectedSuppliers([]);
        onRequestClose();
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Select Suppliers"
            className="z-50 bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto mt-20"
            overlayClassName="z-50 fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start"
        >
            <h2 className="text-2xl font-bold mb-4">Select Suppliers</h2>
            <div className="mb-4 relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search for a supplier"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {suggestions.length > 0 && (
                    <ul className="absolute z-50 bg-white border border-gray-300 rounded-lg mt-2 w-full">
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion.id}
                                onClick={() => handleSupplierSelect(suggestion)}
                                className="cursor-pointer px-4 py-2 hover:bg-blue-100"
                            >
                                {suggestion.nom}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="flex flex-wrap mb-4 max-h-96 overflow-y-auto">
                {previouslySelectedSuppliers.map((supplier, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full m-1 flex items-center">
                        {supplier}
                    </div>
                ))}
                {selectedSuppliers.map((supplier) => (
                    <div key={supplier.id} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full m-1 flex items-center">
                        {supplier.name}
                        <button
                            onClick={() => handleSupplierRemove(supplier.name)}
                            className="ml-2"
                        >
                            <FaXmark color='red' />
                        </button>
                    </div>
                ))}
            </div>
            <div className='flex'>
                <button
                    onClick={handleSubmit}
                    disabled={loading || selectedSuppliers.length === 0 || loadingResend}
                    className={(loading || selectedSuppliers.length === 0) ?
                        "w-full bg-gray-300 px-4 py-2 rounded-md cursor-not-allowed opacity-50" :
                        "w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"}
                >
                    {loading ? 'Sending...' : 'Send Request to New Selected Suppliers'}
                </button>
                <button
                    disabled={loadingResend || previouslySelectedSuppliers.length === 0 || loading}
                    className={(loadingResend || previouslySelectedSuppliers.length === 0) ?
                        "flex items-center justify-center ml-5 w-full bg-gray-300 px-4 py-2 rounded-md cursor-not-allowed opacity-50" :
                        "flex items-center justify-center ml-5 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"}
                    onClick={handleReSend}
                >
                    <IoReload size={24} />
                    <span className='ml-2'>
                        {loadingResend ? 'Sending...' : 'Resend + New Selected Suppliers'}
                    </span>
                </button>
            </div>
        </Modal>
    );
};

export default SupplierSelectionModal;