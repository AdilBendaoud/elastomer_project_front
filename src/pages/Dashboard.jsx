import React, { useState, useEffect } from 'react';
import { IoMdAdd } from "react-icons/io";
import { useQuery } from "react-query";
import { useAuth } from "../context/authContext";
import UserCreationModal from '../components/UserCreationModal';
import UserUpdateModal from '../components/UserUpdateModal';
import { FaRegEdit, FaCheck, FaKey } from "react-icons/fa";
import { MdBlock } from "react-icons/md";
import Swal from 'sweetalert2';
import axios from 'axios';
import UserPasswordModal from '../components/UserPasswordModal';

const fetchAllUsers = async (token, pageNumber, pageSize, searchQuery, role, department) => {
  let url = `${process.env.REACT_APP_API_ENDPOINT}/Users?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  // Add search query parameter if provided
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  // Add role filter parameter if provided
  if (role && role !== 'All') {
    url += `&role=${encodeURIComponent(role)}`;
  }

  // Add department filter parameter if provided
  if (department && department !== 'All') {
    url += `&department=${encodeURIComponent(department)}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });
  return res.json();
};

const departments = ['All', 'IT', 'RH', 'MANT', 'DE']; // Define your departments here

function Dashboard() {
  const auth = useAuth();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const [isUpdateUserPasswordModalOpen, setIsUpdateUserPasswordModalOpen] = useState(false);
  
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Adjust as needed

  const [searchQuery, setSearchQuery] = useState('');
  const openAddUserModal = () => setIsAddUserModalOpen(true);
  const closeAddUserModal = () => setIsAddUserModalOpen(false);
  
  const openUpdateUserModal = (user) => {
    setIsUpdateUserModalOpen(true);
    setUserToUpdate(user);
  };
  const closeUpdateUserModal = () => setIsUpdateUserModalOpen(false);

  const openUpdateUserPasswordModal = (user) =>{
    setIsUpdateUserPasswordModalOpen(true);
    setUserToUpdate(user);
  }
  const closeUpdateUserPasswordModal = () => setIsUpdateUserPasswordModalOpen(false);

  const { data: users, isLoading, refetch } = useQuery(
    ["users", auth.token, currentPage, itemsPerPage, searchQuery, selectedRole, selectedDepartment],
    () => fetchAllUsers(auth.token, currentPage, itemsPerPage, searchQuery, selectedRole, selectedDepartment),
    {
      enabled: !!auth.token,
    }
  );
  const totalPages = Math.ceil(users?.totalCount / itemsPerPage) || 1;
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    refetch();
  }, [searchQuery, selectedRole, selectedDepartment, refetch]);

  const handleBlockUser = async (user, isBlock) => {
    // Show confirmation dialog using SweetAlert
    const confirmed = await Swal.fire({
      title: `${isBlock ? 'Block' : 'Unblock'} User`,
      text: `Are you sure you want to ${(!isBlock && 'un') || ''}block ${user.firstName} ${user.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${(!isBlock && 'un') || ''}block it!`
    });

    if (confirmed.isConfirmed) {
      try {
        await axios.patch(`${process.env.REACT_APP_API_ENDPOINT}/Users/${user.code}/${(!isBlock && "un") || ''}block`, {}, {
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${auth.token}`,
          }
        })
        Swal.fire(
          `${isBlock ? 'Blocked!' : 'Unblocked!'}`,
          `${user.firstName} ${user.lastName} has been ${(!isBlock && 'un') || ''}blocked.`,
          'success'
        );
        refetch()
      } catch (error) {
        // Handle error, e.g., show error message
        Swal.fire(
          'Error!',
          error.message || 'Failed to block user.',
          'error'
        );
      }
    }
  };
  
  return (
    <div className="p-4 sm:ml-64 bg-gray-100 min-h-screen">
      <div className=" p-4 border-2 border-gray rounded-lg bg-white" style={{ marginTop: 130 }}>
        <div className="flex flex-col ">
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className='flex justify-between mb-4'>
                <div className="flex space-x-4">
                  <div className="relative text-gray-500 focus-within:text-gray-900">
                    <div className="absolute inset-y-0 left-1 flex items-center pl-3 pointer-events-none ">
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5 17.5L15.4167 15.4167M15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333C11.0005 15.8333 12.6614 15.0929 13.8667 13.8947C15.0814 12.6872 15.8333 11.0147 15.8333 9.16667Z" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="default-search"
                      className="block w-80 h-11 pr-5 pl-12 py-2.5 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="sr-only">Department</label>
                    <select
                      id="department"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="block w-48 h-11 px-4 py-2.5 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="role" className="sr-only">Role</label>
                    <select
                      id="role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="block w-48 h-11 px-4 py-2.5 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none"
                    >
                      <option value={'All'}>All</option>
                      <option value={'A'}>Admin</option>
                      <option value={'P'}>Purchaser</option>
                      <option value={'D'}>Requesteur</option>
                      <option value={'V'}>Validator</option>
                    </select>
                  </div>
                </div>
                <button onClick={openAddUserModal} type="button" className="flex flex-row items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                  <>
                    <span className="mr-3">Add User</span>
                    <IoMdAdd size={20} />
                  </>
                </button>
              </div>
              {isLoading ? (
                <div className="text-center h-20">
                  <div role="status">
                    <svg aria-hidden="true" className="inline w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="min-w-full rounded-xl">
                    <thead>
                      <tr className="bg-gray-50">
                        <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl"> Code </th>
                        <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> First Name </th>
                        <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Last Name </th>
                        <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Email </th>
                        <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Role </th>
                        <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"> Departement </th>
                        <th scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize rounded-t-xl"> Actions </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {users.items.$values.map(user => (
                        <tr key={user.code} className="bg-white transition-all duration-500 hover:bg-gray-50">
                          <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 "> {user.code}</td>
                          <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {user.firstName}</td>
                          <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {user.lastName}</td>
                          <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {user.email}</td>
                          <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {
                            user.role === 'A' ? 'Admin' :
                              user.role === 'P' ? 'Purchaser' :
                                user.role === 'D' ? 'Requesteur' : 'Validator'}</td>
                          <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"> {user.departement}</td>
                          <td className="p-5 ">
                            <div className="flex items-center gap-1">
                              <button title='Edit user' onClick={() => openUpdateUserModal(user)} className="p-2 rounded-full group transition-all duration-500 flex item-center">
                                <FaRegEdit size={20} color='blue' />
                              </button>
                              {auth.user.code === user.code ? null : user.isActive ?
                                <button title='Block user' onClick={() => handleBlockUser(user, true)} className="p-2 rounded-full group transition-all duration-500 flex item-center">
                                  <MdBlock size={20} color='red' />
                                </button> :
                                <button title='Unblock user' onClick={() => handleBlockUser(user, false)} className="p-2 rounded-full group transition-all duration-500 flex item-center">
                                  <FaCheck size={20} color='green' />
                                </button>
                              }
                              <button onClick={()=> openUpdateUserPasswordModal(user)} title='Change password' className="p-2 rounded-full group transition-all duration-500 flex item-center">
                                <FaKey size={20} color='gray' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`py-2 px-4 rounded-md text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-700 hover:bg-blue-100'}`}>
                      Previous
                    </button>
                    <div className="text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`py-2 px-4 rounded-md text-sm font-medium ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-700 hover:bg-blue-100'}`}>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <UserCreationModal isOpen={isAddUserModalOpen} onRequestClose={closeAddUserModal} />
      <UserUpdateModal isOpen={isUpdateUserModalOpen} onRequestClose={closeUpdateUserModal} user={userToUpdate} />
      <UserPasswordModal isOpen={isUpdateUserPasswordModalOpen} onRequestClose={closeUpdateUserPasswordModal} user={userToUpdate} token={auth.token} />
    </div>
  )
}

export default Dashboard;
