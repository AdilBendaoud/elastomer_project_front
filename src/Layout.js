import React from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <Sidebar />
      <Outlet />
    </QueryClientProvider>
  )
}

export default Layout