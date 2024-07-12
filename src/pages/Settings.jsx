import React from 'react'
import SMTPConfigForm from '../components/SMTPConfigForm'

function Settings() {
  return (
    <div className="sm:ml-64">
        <div style={{marginTop:98}}>
            <SMTPConfigForm />
        </div>
    </div>
  )
}

export default Settings