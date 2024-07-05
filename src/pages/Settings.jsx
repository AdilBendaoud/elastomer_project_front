import React from 'react'
import SMTPConfigForm from '../components/SMTPConfigForm'

function Settings() {
  return (
    <div className="p-4 sm:ml-64">
        <div style={{marginTop:100}}>
            <SMTPConfigForm />
        </div>
    </div>
  )
}

export default Settings