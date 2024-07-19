import React, { useState } from 'react';
import Modal from 'react-modal';
import { useAuth } from '../context/authContext';
import swal from 'sweetalert';
import axios from 'axios';

Modal.setAppElement('#root');

const UserCreationModal = ({ isOpen, onRequestClose }) => {
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Auth/register/${role === 'A' ? 'admin' :
          role === 'P' ? 'acheteur' :
            role === 'D' ? 'demandeur' :
              role === 'V' ? 'validateur' : ''
        }`,
        { firstName, lastName, "email": email+"@elastomer-solutions.com", code, role, departement },
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
        setLoading(false);
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
      setLoading(false);
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
            <option value="FIN">FIN</option>
            <option value="CFO">CFO</option>
            <option value="COO">COO</option>
          </select>
        </div>
        <button
          type="submit"
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
          'Create User'
        )}</button>
      </form>
    </Modal>
  );
};

export default UserCreationModal;
