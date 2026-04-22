import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Quotations from './pages/Quotations.jsx'
import NewQuotation from './pages/NewQuotation.jsx'
import Pipeline from './pages/Pipeline.jsx'
import Leads from './pages/Leads.jsx'
import Email from './pages/Email.jsx'
import Reports from './pages/Reports.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('sx_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/quotations" element={<PrivateRoute><Quotations /></PrivateRoute>} />
        <Route path="/quotations/new" element={<PrivateRoute><NewQuotation /></PrivateRoute>} />
        <Route path="/pipeline" element={<PrivateRoute><Pipeline /></PrivateRoute>} />
        <Route path="/leads" element={<PrivateRoute><Leads /></PrivateRoute>} />
        <Route path="/email" element={<PrivateRoute><Email /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
