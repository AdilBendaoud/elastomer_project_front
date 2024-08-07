import React from 'react';
import Modal from 'react-modal';
Modal.setAppElement('#root');

const RequestHistory = ({ isOpen, onRequestClose, history }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Create Request"
            className="z-50 bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto mt-20"
            overlayClassName="z-50 fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start"
        >
            <h2 className="text-2xl font-bold mb-4">Request History</h2>
            <div className="mb-8" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table className="min-w-full rounded-xl">
                    <thead>
                        <tr className="bg-gray-50">
                            <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl"> User Code </th>
                            <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Action </th>
                            <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Date </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {history?.map((item, index) => (
                            <tr key={index} className="bg-white transition-all duration-500 hover:bg-gray-50">
                                <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {item.userCode}</td>
                                <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {item.details}</td>
                                <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {new Date(item.dateChanged).toLocaleString('fr-FR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};

export default RequestHistory