import React, { useState } from 'react';
import Modal from 'react-modal';
import { useAuth } from '../context/authContext';

Modal.setAppElement('#root');

const UserCreationModal = ({ isOpen, onRequestClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(process.env.REACT_APP_API_ENDPOINT + "/users", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ firstName, lastName, email, password })
      });

      if (response.ok) {
        alert('User created successfully!');
        onRequestClose();
      } else {
        const errorData = await response.json();
        alert('Error: ' + errorData.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Create User"
      className="z-50 bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start"
    >
      <h2 className="text-2xl font-bold mb-4">Create User</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Code</label>
            <input
                type="number"
                id="code"
                name='code'
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
        </div>
        <div className="mb-4 flex">
            <div className='w-50 mr-5'>
            <label htmlFor="FirstName" className="block mb-2 text-sm font-medium text-gray-900">First Name</label>
            <input
                type="text"
                id="FirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            </div>
            <div className='w-50'>
                <label htmlFor="LastName" className="block mb-2 text-sm font-medium text-gray-900">Last Name</label>
                <input
                    type="text"
                    id="LastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className='mb-4'>
            <label for="countries" className="block mb-2 text-sm font-medium text-gray-900">Select a role</label>
            <select id="countries" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                <option selected>Choose a role</option>
                <option value="US">Admin</option>
                <option value="CA">Purchaser</option>
                <option value="FR">Demandeur</option>
                <option value="DE">Validator</option>
            </select>
        </div>
        <div className='mb-4'>
            <label for="countries" className="block mb-2 text-sm font-medium text-gray-900">Select a departement</label>
            <select id="countries" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                <option selected>Choose a departement</option>
                <option value="US">IT</option>
                <option value="CA">MAINT</option>
                <option value="FR">RH</option>
                <option value="DE">..</option>
            </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Create User
        </button>
      </form>
    </Modal>
  );
};

export default UserCreationModal;
