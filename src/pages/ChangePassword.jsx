import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import swal from 'sweetalert';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {token, user, logOut } = useAuth();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      swal({
        title: "Error!",
        text: "Passwords do not match",
        icon: "error",
        timer: 1500,
        button: false
      });
      return;
    }
    try {
      setLoading(true)
      const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/Password/change-password`, { newPassword }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }); 
      if (response.status === 200) {
        swal({
          title: "Success !",
          text: "Password changed successfully",
          icon: "success",
          timer: 2500,
          button: false
        });
        setLoading(false)
        logOut();
      } else {
        swal({
          title: "Error!",
          text: "Failed to change password",
          icon: "error",
          timer: 2500,
          button: false
        });
        setLoading(false);
      }
    } catch (error) {
      swal({
        title: "Error!",
        text: error.response?.data.title || 'An error occurred',
        icon: "error",
        timer: 2000,
        button: false
      });
      setLoading(false)
    }
  };

  return (
    <section className="bg-gray-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <img className='mb-3' src="./static/images/elastomer-logo.jpeg" width={400} alt="Elastomer Solution Logo" />
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Change Password
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleChangePassword}>
              <div className="mb-6 relative">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">New Password</label>
                <input
                  tabIndex={1}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  name="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-7 right-2 px-3 py-2 text-gray-600 hover:text-gray-800 focus:outline-none">
                  {showPassword ? <FiEyeOff size={24} /> : <FiEye size={24} />}
                </button>
              </div>
              <div className="mb-6 relative">
                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900">Confirm Password</label>
                <input
                  tabIndex={2}
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  name="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-7 right-2 px-3 py-2 text-gray-600 hover:text-gray-800 focus:outline-none">
                  {showConfirmPassword ? <FiEyeOff size={24} /> : <FiEye size={24} />}
                </button>
              </div>

              <button
                type="submit"
                tabIndex={3}
                disabled={loading}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >{loading ? (
                <div role="status">
                  <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                'Change Password'
              )}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChangePassword;
