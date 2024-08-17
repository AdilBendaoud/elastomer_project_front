import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/authContext';
import swal from 'sweetalert';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Swal from 'sweetalert2';

const fetchEmailSettings = async ({ queryKey }) => {
  const [_, token] = queryKey;
  const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Settings/get-email-settings`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

const SMTPConfigForm = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [loadingTest, setLoadingTest] = useState(false);

  const { data: smtpConfig, isLoading, error } = useQuery(['emailSettings', token], fetchEmailSettings);

  const [formValues, setFormValues] = useState({
    smtpServer: '',
    port: 587,
    username: '',
    password: '',
    enableSsl: false,
    from: '',
    useAuthentication: false
  });

  useEffect(() => {
    if (smtpConfig) {
      setFormValues({
        smtpServer: smtpConfig.smtpServer,
        port: smtpConfig.port,
        username: smtpConfig.useAuthentication ? smtpConfig.username : '',
        password: smtpConfig.useAuthentication ? smtpConfig.password : '',
        enableSsl: smtpConfig.enableSsl,
        from: smtpConfig.from,
        useAuthentication: smtpConfig.useAuthentication
      });
    }
  }, [smtpConfig]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const mutation = useMutation(
    updatedSettings => {
      return axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Settings/update-email-settings`, updatedSettings, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('emailSettings');
        swal({
          title: "Success!",
          text: "Configuration updated successfully!",
          icon: "success",
          timer: 2500,
          button: false
        });
      },
      onError: (error) => {
        swal({
          title: "Error!",
          text: error.response?.data?.message || 'An error occurred',
          icon: "error",
          timer: 2500,
          button: false
        });
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formValues);
  };

  const sendEmail = async () => {
    try {
      setLoadingTest(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/Settings/smtp-test`,
        email,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        Swal.fire(
          "Success",
          "Email Sent .",
          'success'
        );
        setLoadingTest(false);
      }
    } catch (error) {
      console.log(error)
      Swal.fire(
        'Error!',
        'Failed to send email .',
        'error'
      );
      setLoadingTest(false);
    }
  }

  if (isLoading) return <div className="pt-36">Loading...</div>;
  if (error) return <div className="pt-36">Error loading settings: {error.message}</div>;

  return (
    <div className="pt-36 flex justify-center items-center bg-gray-100">
      <div className="bg-white flex items-center justify-around p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <div className='w-1/2 mr-10'>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">SMTP Configuration</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="SmtpServer" className="block text-gray-700">SMTP Server</label>
              <input
                type="text"
                id="SmtpServer"
                name="smtpServer"
                value={formValues.smtpServer}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="Port" className="block text-gray-700">Port</label>
              <input
                type="number"
                id="Port"
                name="port"
                value={formValues.port}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="EnableSsl"
                name="enableSsl"
                checked={formValues.enableSsl}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="EnableSsl" className="text-gray-700">Enable SSL</label>
            </div>
            <div className="mb-4">
              <label htmlFor="From" className="block text-gray-700">From Email</label>
              <input
                type="email"
                id="From"
                name="from"
                value={formValues.from}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="UseAuthentication"
                name="useAuthentication"
                checked={formValues.useAuthentication}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="UseAuthentication" className="text-gray-700">Use Authentication</label>
            </div>
            {formValues.useAuthentication && (
              <>
                <div className="mb-4">
                  <label htmlFor="Username" className="block text-gray-700">Username</label>
                  <input
                    type="text"
                    id="Username"
                    name="username"
                    value={formValues.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6 relative">
                  <label htmlFor="Password" className="block text-gray-700">Password</label>
                  <input
                    tabIndex={1}
                    type={showPassword ? "text" : "password"}
                    id="Password"
                    name="password"
                    value={formValues.password}
                    onChange={handleChange}
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
              </>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Save Configuration
            </button>
          </form>
        </div>
        <div className='w-1/2'>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">SMTP Test</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            onClick={sendEmail}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            disabled={loadingTest}
          >
            {loadingTest ? 'Sending...' : 'Send Test Mail'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SMTPConfigForm;
