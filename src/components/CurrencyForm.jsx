import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import swal from 'sweetalert';
import axios from 'axios';

const fetchCurrencySettings = async () => {
  const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/Settings/get-currency-settings`);
  return response.data;
};

const CurrencyForm = () => {
  const queryClient = useQueryClient();

  const { data: currencyConfig, isLoading, error } = useQuery(['currencySettings'], fetchCurrencySettings);

  const [formValues, setFormValues] = useState({
    madToEur: '',
    usdToEur: '',
    gbpToEur: ''
  });

  useEffect(() => {
    if (currencyConfig) {
      setFormValues({
        madToEur: currencyConfig.madToEur || 0,
        usdToEur: currencyConfig.usdToEur || 0,
        gbpToEur: currencyConfig.gbpToEur || 0,
      });
    }
  }, [currencyConfig]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const mutation = useMutation(
    updatedSettings => {
      return axios.put(`${process.env.REACT_APP_API_ENDPOINT}/Settings/update-currency-settings`, updatedSettings);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('currencySettings');
        swal({
          title: "Success!",
          text: "Currency rates updated successfully!",
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading settings: {error.message}</div>;

  return (
    <div className="py-10 flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Currency Conversion Settings</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="madToEur" className="block text-gray-700">MAD to EUR</label>
            <input
              type="number"
              step="0.01"
              id="madToEur"
              name="madToEur"
              value={formValues.madToEur}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="usdToEur" className="block text-gray-700">USD to EUR</label>
            <input
              type="number"
              step="0.01"
              id="usdToEur"
              name="usdToEur"
              value={formValues.usdToEur}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="usdToEur" className="block text-gray-700">GBP to EUR</label>
            <input
              type="number"
              step="0.01"
              id="gbpToEur"
              name="gbpToEur"
              value={formValues.gbpToEur}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default CurrencyForm;