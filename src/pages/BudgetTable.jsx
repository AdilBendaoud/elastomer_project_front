import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { PiPencilSimpleLine } from 'react-icons/pi';

const BudgetTable = () => {
    const [departement, setDepartement] = useState('');
    const [budgetData, setBudgetData] = useState({
        initialBudget: Array(12).fill(0),
        salesBudget: Array(12).fill(0),
        salesForecast: Array(12).fill(0),
        adjustment: Array(12).fill(0),
        budgetV2: Array(12).fill(0),
        budgetIP: Array(12).fill(0),
        actual: Array(12).fill(0),
        saving: Array(12).fill(0),
        to: Array(12).fill(0),
        percentOfSales: Array(12).fill(0),
        percentOfPurchases: Array(12).fill(0),
    });
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const tableRef = useRef(null); 
    
    useEffect(() => {
        if (departement) {
            axios.get(`${process.env.REACT_APP_API_ENDPOINT}/budget`, {
                params: { departement }
            }).then(response => {
                const data = response.data;
                setBudgetData(prevBudgetData => ({
                    ...prevBudgetData,
                    initialBudget: data.initialBudget || Array(12).fill(0),
                    salesBudget: data.salesBudget || Array(12).fill(0),
                    salesForecast: data.salesForecast || Array(12).fill(0),
                    adjustment: data.adjustment || Array(12).fill(0),
                    budgetIP: data.budgetIP || Array(12).fill(0),
                    actual: data.actual || Array(12).fill(0),
                    to: data.to || Array(12).fill(0),
                }));
                recalculateBudget();
            });
        }
    }, [departement]);

    useEffect(() => {
        // Scroll to the current month
        if (tableRef.current) {
            const table = tableRef.current;
            const columnWidth = 150;
            const currentMonthIndex = 11; // Get current month index (0 = January, 11 = December)
            const scrollPosition = columnWidth * currentMonthIndex; // Calculate the scroll position
            table.scrollLeft = scrollPosition;
        }
    }, [budgetData]);

    const recalculateBudget = useCallback(() => {
        setBudgetData(prevBudgetData => {
            const budgetV2 = prevBudgetData.initialBudget.map((initial, month) => {
                if (prevBudgetData.salesBudget[month] === 0 || prevBudgetData.salesForecast[month] === 0) return 0;
                return initial * (prevBudgetData.salesForecast[month] / prevBudgetData.salesBudget[month]) * (1 - prevBudgetData.adjustment[month] / 100);
            });

            const saving = budgetV2.map((v2, month) => v2 - prevBudgetData.actual[month]);

            const percentOfPurchases = prevBudgetData.actual.map((actual, month) => {
                if (budgetV2[month] === 0) return 0;
                return (actual / budgetV2[month]) * 100;
            });

            const percentOfSales = prevBudgetData.actual.map((actual, month) => {
                if (prevBudgetData.salesForecast[month] === 0) return 0;
                return (prevBudgetData.to[month] / prevBudgetData.salesForecast[month]) * 100;
            });

            return {
                ...prevBudgetData,
                budgetV2,
                saving,
                percentOfSales,
                percentOfPurchases,
            };
        });
    }, []);

    const handleInputChange = (value, month, field) => {
        setBudgetData(prevBudgetData => {
            const updatedData = [...prevBudgetData[field]];
            updatedData[month] = parseFloat(value) || 0;
            return {
                ...prevBudgetData,
                [field]: updatedData,
            };
        });

        recalculateBudget();
    };

    const handleSubmit = () => {
        if (departement) {
            setLoading(true);
            axios.post(`${process.env.REACT_APP_API_ENDPOINT}/budget`, {
                departement,
                "initialBudget": budgetData.initialBudget,
                "salesBudget": budgetData.salesBudget,
                "salesForecast": budgetData.salesForecast,
                "adjustment": budgetData.adjustment,
                "budgetIP": budgetData.budgetIP
            }).then(response => {
                if (response.status === 200) {
                    Swal.fire(
                        "Success",
                        "Budget data saved successfully!",
                        'success'
                    );
                    setLoading(false);
                    setEditMode(false);
                }
            }).catch(error => {
                Swal.fire(
                    'Error!',
                    'Failed to save budget data.',
                    'error'
                );
                setLoading(false);
            });
        } else {
            Swal.fire(
                'Error!',
                'Please select a department before saving.',
                'error'
            );
        }
    };

    return (
        <div className="py-9 px-8 bg-gray-100 min-h-screen">
            <div className="px-6 py-4 border-2 border-gray-300 rounded-lg bg-white mt-24">
                <div className="flex justify-between mb-5">
                    <div>
                        <select
                            className="border p-2 mr-3 rounded-lg text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={departement}
                            onChange={(e) => setDepartement(e.target.value)}
                        >
                            <option value="" disabled>Select Department</option>
                            <option value="Maintenance General">Maintenance General</option>
                            <option value="Inginierie">Inginierie</option>
                            <option value="Logistique">Logistique</option>
                            <option value="Production">Production</option>
                            <option value="Qualite">Qualite</option>
                            <option value="IT">IT</option>
                            <option value="Ressources Humaines">Ressources Humaines</option>
                            <option value="Finance">Finance</option>
                        </select>
                    </div>
                    {
                        departement && !editMode &&
                        <button
                            onClick={() => setEditMode(true)}
                            type="button"
                            className="flex text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 shadow-md"
                            disabled={loading}
                        >
                            <PiPencilSimpleLine size={22} style={{marginRight:5}}/> <span> Edit Budget Data</span>
                        </button>
                    }
                    {
                        editMode &&
                        <button
                            onClick={handleSubmit}
                            type="button"
                            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 shadow-md"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Budget Data'}
                        </button>
                    }
                </div>
                <div ref={tableRef} style={{overflowX:'scroll'}}>
                    <table  className="table-auto w-full bg-white border shadow-md rounded-lg">
                        <thead>
                            <tr className="bg-blue-500 text-white text-center">
                                <th className="py-3 px-4 text-left sticky left-0 bg-blue-500 z-10">Budget Fields</th>
                                {Array.from({ length: new Date().getMonth() + 1 }, (_, i) => (
                                    <th className="py-3 px-4" key={i}>
                                        {new Date(2023, i).toLocaleString('default', { month: 'short' })}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(budgetData).map(([key, values], rowIndex) => (
                                <tr key={key} className="text-center">
                                    <td style={{ minWidth: 150 }} className="py-3 px-4 border text-left sticky left-0 bg-gray-50 font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                                    {values.slice(0, new Date().getMonth() + 1).map((value, monthIndex) => (
                                        <td style={{ minWidth: 150 }} className="py-3 px-4 border" key={monthIndex}>
                                            {!editMode ? <span className="text-gray-700">
                                                {['percentOfSales', 'percentOfPurchases'].includes(key) ? (
                                                    `${value.toFixed(2)} %`
                                                ) : (
                                                    `€ ${value.toFixed(2)}`
                                                )}
                                            </span> : ['initialBudget', 'salesBudget', 'salesForecast', 'adjustment', 'budgetIP'].includes(key) ? (
                                                <input
                                                    min={0}
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => handleInputChange(e.target.value, monthIndex, key)}
                                                    className="w-full text-center bg-gray-50 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <span className="text-gray-700">
                                                    {['percentOfSales', 'percentOfPurchases'].includes(key) ? (
                                                        `${value.toFixed(2)} %`
                                                    ) : (
                                                        `€ ${value.toFixed(2)}`
                                                    )}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BudgetTable;