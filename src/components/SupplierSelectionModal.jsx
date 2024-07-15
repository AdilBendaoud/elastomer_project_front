import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import Swal from 'sweetalert2';

Modal.setAppElement('#root');

const SupplierSelectionModal = ({ isOpen, onRequestClose, request }) => {
    const { token, user } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/suppliers`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setSuppliers(response.data);
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            }
        };
        if (isOpen) {
            fetchSuppliers();
        }
    }, [isOpen, token]);

    const handleSupplierToggle = (supplierId) => {
        setSelectedSuppliers(prev =>
            prev.includes(supplierId)
                ? prev.filter(id => id !== supplierId)
                : [...prev, supplierId]
        );
    };

    const handleSubmit = async () => {
        const requestCode = request.code;
        const userCode = user.code;
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Suppliers/send-to-suppliers`, {
                userCode,
                requestCode,
                supplierIds: selectedSuppliers
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                Swal.fire({
                    title: "Success !",
                    text: "Request sent to suppliers successfully !",
                    icon: 'success',
                    showCancelButton: false,
                    timer: 2000
                });
                setLoading(false);
                onRequestClose();
            } else {
                Swal.fire({
                    title: "Eroor !",
                    text: "Failed to send request to suppliers !",
                    icon: 'error',
                    showCancelButton: false,
                    timer: 2000
                });
                setLoading(false);
            }
        } catch (error) {
            Swal.fire({
                title: "Eroor !",
                text: "An error occurred !",
                icon: 'error',
                showCancelButton: false,
                timer: 2000
            });
            console.error('Error sending request to suppliers:', error);
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Select Suppliers"
            className="z-50 bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto mt-20"
            overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start"
        >
            <h2 className="text-2xl font-bold mb-4">Select Suppliers</h2>
            <div className="mb-4 max-h-80 overflow-y-auto">
                {suppliers.map(supplier => (
                    <div key={supplier.id} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            id={`supplier-${supplier.id}`}
                            checked={selectedSuppliers.includes(supplier.id)}
                            onChange={() => handleSupplierToggle(supplier.id)}
                            className="mr-2"
                        />
                        <label htmlFor={`supplier-${supplier.id}`} className="text-gray-900">
                            {supplier.nom}
                        </label>
                    </div>
                ))}
            </div>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            >{loading ? (
                <div role="status">
                    <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            ) : (
                'Send Request to Selected Suppliers'
            )}</button>
        </Modal>
    );
};

export default SupplierSelectionModal;