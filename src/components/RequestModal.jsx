import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useAuth } from '../context/authContext';
import swal from 'sweetalert';
import axios from 'axios';
import { FaRegTrashCan } from "react-icons/fa6";
import { PiPencilSimpleLine } from 'react-icons/pi';

Modal.setAppElement('#root');

const RequestModal = ({ isOpen, onRequestClose, code, request, articles, mode, update }) => {
    const { token, user } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [familleDeProduit, setFamilleDeProduit] = useState('');
    const [destination, setDestination] = useState('');
    const [quantity, setQuantity] = useState('');
    const [items, setItems] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [editItemId, setEditItemId] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionType, setSuggestionType] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === 'update' && articles) {
            const formattedArticles = articles.filter(item=> item.name != "Delivery Fee").map((item) => ({
                localId: Date.now() + Math.random(), // Generate a unique local ID
                id: item.id || null,
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                familleDeProduit: item.familleDeProduit || '',
                destination: item.destination || ''
            }));
            setItems(formattedArticles);
        } else {
            setItems([]);
        }
    }, [mode, articles]);

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

    const addItem = () => {
        if (name.trim() === '' || description.trim() === '' || quantity.trim() === '') {
            return;
        }
        setItems(prev => [...prev, {
            localId: Date.now() + Math.random(), // Generate a unique local ID
            id: null,
            name,
            description,
            quantity: parseInt(quantity),
            familleDeProduit,
            destination
        }]);
        setName('');
        setDescription('');
        setFamilleDeProduit('');
        setDestination('');
        setQuantity('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newArray = items.map(({ localId, ...rest }) => rest);
        const data = {
            code,
            demandeurCode: user.code,
            demandeurId: user.id,
            articles: newArray
        };
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Demande`, data);
            if (response.status === 200) {
                swal({
                    title: "Success!",
                    icon: "success",
                    text: "Request Created Successfully",
                    buttons: false,
                    timer: 1500,
                });
                setLoading(false);
                setItems([]);
                onRequestClose();
            }
        } catch (error) {
            swal({
                title: "Error!",
                icon: "error",
                text: error.message,
                buttons: false,
                timer: 1500,
            });
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const newArray = items.map(({ localId, ...rest }) => rest);
        const data = {
            userCode: user.code,
            demandeCode: request.code,
            articles: newArray
        };

        try {
            setLoading(true);
            const response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${request.code}/update-articles`, data);
            if (response.status === 200) {
                swal({
                    title: "Success!",
                    icon: "success",
                    text: "Request Updated Successfully",
                    buttons: false,
                    timer: 1500,
                });
                update(request.code);
                setLoading(false);
                onRequestClose();
            }
        } catch (error) {
            swal({
                title: "Error!",
                icon: "error",
                text: error.message,
                buttons: false,
                timer: 1500,
            });
            setLoading(false);
        }
    };

    const deleteItem = (localId) => {
        setItems(prev => prev.filter(i => i.localId !== localId));
    };

    const editItem = (localId) => {
        const thisItem = items.find(i => i.localId === localId);
        setName(thisItem.name);
        setDescription(thisItem.description);
        setQuantity(thisItem.quantity);
        setFamilleDeProduit(thisItem.familleDeProduit);
        setDestination(thisItem.destination);
        setEditItemId(localId);
        setIsEdit(true);
    };

    const saveItem = () => {
        const updatedItems = items.map(item =>
            item.localId === editItemId ? { ...item, name, description, quantity, familleDeProduit, destination } : item
        );
        setItems(updatedItems);
        reset();
    };

    const reset = () => {
        setName('');
        setDescription('');
        setQuantity('');
        setFamilleDeProduit('');
        setDestination('');
        setIsEdit(false);
    }

    const closeModal = () => {
        reset()
        setSuggestions([])
        setSuggestionType('')
        onRequestClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Request Modal"
            className="z-40 bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl mx-auto mt-10"
            overlayClassName="z-40 fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start"
        >
            <h2 className="text-2xl font-bold mb-4">{mode === 'create' ? 'Create Request' : 'Update Request'} - {code}</h2>
            <form onSubmit={mode === 'create' ? handleSubmit : handleUpdate}>
                <div className='flex flex-row mb-8 items-end'>
                    <div className="mr-4">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Article</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleInputChange(setName, "article")}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {suggestions.length > 0 && suggestionType === "article" && (
                            <ul className="absolute z-50 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => { setName(suggestion.nom); setDescription(suggestion.description); setSuggestions([]); }}
                                    >
                                        <div className="font-semibold">{suggestion.nom}</div>
                                        <div className="text-sm text-gray-600">{suggestion.description}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="mr-4">
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={handleInputChange(setDescription, "description")}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {suggestions.length > 0 && suggestionType === "description" && (
                            <ul className="absolute z-50 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => { setDescription(suggestion.description); setSuggestions([]); }}
                                    >
                                        <div className="font-semibold">{suggestion.description}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="mr-4">
                        <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">Quantity</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mr-4">
                        <label htmlFor="familleDeProduit" className="block mb-2 text-sm font-medium text-gray-900">Famille De Produit</label>
                        <input
                            type="text"
                            id="familleDeProduit"
                            value={familleDeProduit}
                            onChange={handleInputChange(setFamilleDeProduit, "familleDeProduit")}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {suggestions.length > 0 && suggestionType === "familleDeProduit" && (
                            <ul className="absolute z-50 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => { setFamilleDeProduit(suggestion.familleDeProduit); setSuggestions([]); }}
                                    >
                                        <div className="font-semibold">{suggestion.familleDeProduit}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="mr-4">
                        <label htmlFor="destination" className="block mb-2 text-sm font-medium text-gray-900">Destination</label>
                        <input
                            type="text"
                            id="destination"
                            value={destination}
                            onChange={handleInputChange(setDestination, "destination")}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {suggestions.length > 0 && suggestionType === "destination" && (
                            <ul className="absolute z-50 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => { setDestination(suggestion.destination); setSuggestions([]); }}
                                    >
                                        <div className="font-semibold">{suggestion.destination}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={isEdit ? saveItem : addItem}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                        >
                            {isEdit ? 'Save' : 'Add'}
                        </button>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Articles</label>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b">Name</th>
                                    <th className="px-4 py-2 border-b">Description</th>
                                    <th className="px-4 py-2 border-b">Quantity</th>
                                    <th className="px-4 py-2 border-b">Famille De Produit</th>
                                    <th className="px-4 py-2 border-b">Destination</th>
                                    <th className="px-4 py-2 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.localId}>
                                        <td className="px-4 py-2 border-b">{item.name}</td>
                                        <td className="px-4 py-2 border-b">{item.description}</td>
                                        <td className="px-4 py-2 border-b">{item.quantity}</td>
                                        <td className="px-4 py-2 border-b">{item.familleDeProduit}</td>
                                        <td className="px-4 py-2 border-b">{item.destination}</td>
                                        <td className="px-4 py-2 border-b">
                                            <button
                                                type="button"
                                                onClick={() => editItem(item.localId)}
                                                className="px-2 py-1 text-blue-500 hover:text-blue-700"
                                            >
                                                <PiPencilSimpleLine className="inline-block" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteItem(item.localId)}
                                                className="px-2 py-1 text-red-500 hover:text-red-700"
                                            >
                                                <FaRegTrashCan className="inline-block" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : mode === 'create' ? 'Create Request' : 'Update Request'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default RequestModal;