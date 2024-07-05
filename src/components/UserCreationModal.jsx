import React, { useState } from 'react';
import Modal from 'react-modal';
import { useAuth } from '../context/authContext';
import swal from 'sweetalert';
import axios from 'axios';

Modal.setAppElement('#root');

const UserCreationModal = ({ isOpen, onRequestClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState('');
  const [departement, setDepartement] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (code.length > 4) {
      swal({
        title: "Error!",
        text: "Employee ID should be 4 characters or less",
        icon: "error",
        timer: 2500,
        button: false
      });
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Auth/register/${
          role === 'A' ? 'admin' :
          role === 'P' ? 'acheteur' :
          role === 'D' ? 'demandeur' : 
          role === 'V' ? 'validateur' : ''
        }`,
        { firstName, lastName, "email" : email+"@elastomer-solutions.com", code, role, departement }, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },    
      });

      if (response.status === 200) {
        swal({
          title: "Success!",
          text: "User created successfully!",
          icon: "success",
          timer: 2500,
          button: false
        });
        onRequestClose();
      }
    } catch (err) {
      swal({
        title: "Error!",
        text: err.response?.data || 'An error occurred',
        icon: "error",
        timer: 2500,
        button: false
      });
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
          <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-900">Employee ID</label>
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
          <div className='w-1/2 mr-5'>
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
          <div className='w-1/2'>
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
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className='mb-4'>
          <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900">Select a Role</label>
          <select
            id="role"
            name='role'
            value={role}
            onChange={e => setRole(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            required
          >
            <option value="" disabled>Choose a role</option>
            <option value="A">Admin</option>
            <option value="P">Purchaser</option>
            <option value="D">Requesteur</option>
            <option value="V">Validator</option>
          </select>
        </div>
        <div className='mb-4'>
          <label htmlFor="departement" className="block mb-2 text-sm font-medium text-gray-900">Select a Departement</label>
          <select
            id="departement"
            name='departement'
            value={departement}
            onChange={e => setDepartement(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            required
          >
            <option value="" disabled>Choose a departement</option>
            <option value="IT">IT</option>
            <option value="MAINT">MAINT</option>
            <option value="RH">RH</option>
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
