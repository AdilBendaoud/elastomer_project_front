import React from 'react'
import SMTPConfigForm from '../components/SMTPConfigForm'
import CurrencyForm from '../components/CurrencyForm'

function Settings() {
  return (
    <div className="sm:ml-64">
        <div>
            <SMTPConfigForm />
            <CurrencyForm />
        </div>
    </div>
  )
}

export default Settings