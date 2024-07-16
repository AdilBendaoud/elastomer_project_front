import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useAuth } from '../context/authContext';
import swal from 'sweetalert';
import axios from 'axios';
import { FaRegTrashCan } from "react-icons/fa6";
import { PiPencilSimpleLine } from 'react-icons/pi';

Modal.setAppElement('#root');

const RequestModal = ({ isOpen, onRequestClose, code, request, articles, mode }) => {
    const { token, user } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [familleDeProduit, setFamilleDeProduit] = useState('');
    const [destination, setDestination] = useState('');
    const [quantity, setQuantity] = useState('');
    const [items, setItems] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [id, setId] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionType, setSuggestionType] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === 'update' && articles) {
            const formattedArticles = articles.map((item, index) => ({
                id: index,
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
        setItems(prev => [...prev, { id: Date.now(), name, description, quantity: parseInt(quantity), familleDeProduit, destination }]);
        setName('');
        setDescription('');
        setFamilleDeProduit('');
        setDestination('');
        setQuantity('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newArray = items.map(({ id, ...rest }) => rest);
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
        const newArray = items.map(({ id, ...rest }) => rest);
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

    const deleteItem = (id) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const editItem = (id) => {
        const thisItem = items.find(i => i.id === id);
        setName(thisItem.name);
        setDescription(thisItem.description);
        setQuantity(thisItem.quantity);
        setFamilleDeProduit(thisItem.familleDeProduit);
        setDestination(thisItem.destination);
        setId(id);
        setIsEdit(true);
    };

    const saveItem = () => {
        const updatedItems = items.map(item =>
            item.id === id
                ? { ...item, name, description, quantity, familleDeProduit, destination }
                : item
        );
        setItems(updatedItems);
        reset();
    };

    const reset = ()=>{
        setName('');
        setDescription('');
        setQuantity('');
        setFamilleDeProduit('');
        setDestination('');
        setIsEdit(false);
    }

    const closeModal = ()=>{
        reset()
        onRequestClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Request Modal"
            className="z-50 bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl mx-auto mt-20"
            overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start"
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
                            <ul className="absolute z-10 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => { setName(suggestion.nom); setSuggestions([]); }}
                                    >
                                        <div className="font-semibold">{suggestion.nom}</div>
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
                            <ul className="absolute z-10 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => { setDescription(suggestion.description); setSuggestions([]); }}
                                    >
                                        <div className="text-sm text-gray-600">{suggestion.description}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="mr-4">
                        <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">Quantity</label>
                        <input
                            min={1}
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mr-4">
                        <label htmlFor="familleDeProduit" className="block mb-2 text-sm font-medium text-gray-900">Product Family</label>
                        <input
                            type="text"
                            id="familleDeProduit"
                            value={familleDeProduit}
                            onChange={handleInputChange(setFamilleDeProduit, "familleDeProduit")}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {suggestions.length > 0 && suggestionType === "familleDeProduit" && (
                            <ul className="absolute z-10 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
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
                            <ul className="absolute z-10 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
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
                    <div className="mr-4">
                        {isEdit ? (
                            <div className='flex gap-1'>
                                <button
                                    type="button"
                                    className="px-2  py-2 bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onClick={saveItem}
                                >
                                    Save Item
                                </button>
                                <button
                                    type="button"
                                    className="px-2 py-2 bg-red-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onClick={reset}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={addItem}
                            >
                                Add Item
                            </button>
                        )}
                    </div>
                </div>
                <div className="mb-8" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <table className="min-w-full rounded-xl">
                        <thead>
                            <tr className="bg-gray-50">
                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl"> Name </th>
                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Description </th>
                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Destination </th>
                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Product Family </th>
                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Quantity </th>
                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl"> Actions </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300">
                            {items.map((item, index) => (
                                <tr key={index} className="bg-white transition-all duration-500 hover:bg-gray-50">
                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {item.name}</td>
                                    <td className="hideScrollBar p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900" style={{ maxWidth: '300px', overflowX: 'auto' }}>
                                        <div style={{ whiteSpace: 'nowrap' }}>{item.description}</div>
                                    </td>
                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {item.destination}</td>
                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {item.familleDeProduit}</td>
                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {item.quantity}</td>
                                    <td className="p-5 ">
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => editItem(item.id)}
                                                title='Edit item'
                                                className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200">
                                                <PiPencilSimpleLine size={24} color='#1A202C' />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteItem(item.id)}
                                                title='Delete item'
                                                className="p-2 rounded-full group transition-all duration-500 flex item-center hover:bg-gray-200">
                                                <FaRegTrashCan size={20} color='red' />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    disabled={items.length > 0 ? false : true}
                    type="submit"
                    className={items.length > 0 ?
                        "w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200" :
                        "w-full bg-gray-300 px-4 py-2 rounded-lg cursor-not-allowed opacity-50"}
                >{loading ?
                    <div role="status">
                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                    : <span>{mode === 'create' ? 'Create Request' : 'Update Request'}</span>
                    }</button>
            </form>
        </Modal>
    );
};

export default RequestModal;