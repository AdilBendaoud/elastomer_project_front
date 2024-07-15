import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useAuth } from '../context/authContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FaRegTrashCan } from "react-icons/fa6";
import { PiPencilSimpleLine } from 'react-icons/pi';

Modal.setAppElement('#root');

const UpdateRequestModal = ({ isOpen, onRequestClose, request, articles }) => {
    const { token, user } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [count, setCount] = useState(0);
    const [quantity, setQuantity] = useState('');
    const [items, setItems] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [id, setId] = useState('');
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [descriptionSuggestions, setDescriptionSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const formattedArticles = articles.map((item, index) => ({
            id: index,
            name: item.name,
            description: item.description,
            quantity: item.quantity
        }));
        setItems(formattedArticles);
        setCount(formattedArticles.length);
    }, [articles])

    const fetchNameSuggestions = async (query) => {
        if (!query) {
            setNameSuggestions([]);
            return;
        }
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/products-suggestions`, {
                params: { name: query }
            });
            console.log(response);
            setNameSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const fetchDescriptionSuggestions = async (query) => {
        if (!query) {
            setDescriptionSuggestions([]);
            return;
        }
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Demande/products-suggestions`, {
                params: { description : query }
            });
            setDescriptionSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleNameSuggestionClick = (suggestion) => {
        setName(suggestion.nom);
        setNameSuggestions([]);
    };

    const handleDescriptionSuggestionClick = (currentValue) => {
        setDescription(currentValue);
        setDescriptionSuggestions([]);
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        fetchNameSuggestions(value);
    };
    
    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        fetchDescriptionSuggestions(value);
    };

    const addItem = () => {
        if (name.trim() === '' || description.trim() === '' || quantity.trim() === '') {
            return;
        }
        setItems(prev => [...prev, { id: count, name, description, quantity: parseInt(quantity) }]);
        setCount(count + 1);
        setName('');
        setDescription("");
        setQuantity("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newArray = items.map(({ id, ...rest }) => rest);
        var data = {
            "userCode": user.code,
            "demandeCode": request.code,
            "articles": newArray
        };

        try {
            setLoading(true)
            const response = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Demande/${request.code}/update-articles`, data);
            if (response.status === 200) {
                Swal.fire({
                    title: "Success !",
                    text: "Request Created Successfully !",
                    icon: 'success',
                    showCancelButton: false,
                    timer: 2000
                });
                setLoading(false);
            }
            setItems([]);
            onRequestClose();
        } catch (error) {
            Swal.fire({
                title: "Error !",
                icon: "error",
                text: error.message,
                showCancelButton: false,
                timer: 1500,
            });
            setLoading(true);
        }
    };

    const deleteItem = (id) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    const editItem = (id) => {
        const thisItem = items.find(i => i.id == id);
        setName(thisItem.name);
        setDescription(thisItem.description);
        setQuantity(thisItem.quantity);
        setId(id);
        setIsEdit(true);
    }

    const saveItem = () => {
        var objIndex = items.findIndex(obj => obj.id == id);
        items[objIndex].name = name;
        items[objIndex].description = description;
        items[objIndex].quantity = quantity;
        setName('');
        setDescription("");
        setQuantity("");
        setIsEdit(false);
        setNameSuggestions([]);
        setDescriptionSuggestions([]);
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Create Request"
            className="z-50 bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto mt-20"
            overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start"
        >
            <h2 className="text-2xl font-bold mb-4">{request?.code}</h2>
            <form onSubmit={handleSubmit}>
                <div className='flex flex-row mb-8 items-end'>
                    <div className="mr-4">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Article</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleNameChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {nameSuggestions.length > 0 && (
                            <ul className="absolute z-10 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {nameSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleNameSuggestionClick(suggestion)}
                                    >
                                        <div className="font-semibold">{suggestion.nom}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* {descriptionSuggestions.length > 0 && (
                            <ul className="absolute z-10 max-w-4xl bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {descriptionSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleDescriptionSuggestionClick(suggestion)}
                                    >
                                        <div className="text-sm text-gray-600">{suggestion.description}</div>
                                    </li>
                                ))}
                            </ul>
                        )} */}
                    </div>
                    <div className="mr-4">
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mr-4">
                        <label htmlFor="Quantity" className="block mb-2 text-sm font-medium text-gray-900">Quantity</label>
                        <input
                            min={1}
                            type="number"
                            id="Quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {isEdit ? <button
                        type="button"
                        onClick={saveItem}
                        className="h-10 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Save
                    </button> : <button
                        type="button"
                        onClick={addItem}
                        className="h-10 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Add to Request
                    </button>}
                </div>
                <div className="mb-8" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <table className="min-w-full rounded-xl">
                        <thead>
                            <tr className="bg-gray-50">
                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl"> Name </th>
                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Description </th>
                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Quantity </th>
                                <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl"> Actions </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300">
                            {items.map((item, index) => (
                                <tr key={index} className="bg-white transition-all duration-500 hover:bg-gray-50">
                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {item.name}</td>
                                    <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {item.description}</td>
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
                >{loading ? (
                    <div role="status">
                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                ) : (
                    'Update Request'
                )}</button>
            </form>
        </Modal>
    );
};
export default UpdateRequestModal