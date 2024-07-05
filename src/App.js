import { useEffect, useState } from 'react';
import './App.css';
import { useAuth } from './context/authContext';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <Navbar />
        <Sidebar />
        <Dashboard/>
      </QueryClientProvider>
    </div>
  );
}

export default App;
