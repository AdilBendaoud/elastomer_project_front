import React, { useState } from 'react'
import { useAuth } from '../context/authContext';
import EmailRequest from '../components/passwordReset/EmailRequest';
import CodeVerification from '../components/passwordReset/CodeVerification';
import PasswordReset from "../components/passwordReset/PasswordReset";
function ForgotPass() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [codeVerificationVesibile, setCodeVerificationVesibile] = useState(false);
    const [passwordResetVesibile, setPasswordResetVesibile] = useState(false);
    const {token} = useAuth();

    return (
        <section className="bg-gray-50">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <img className='mb-3' src="./static/images/elastomer-logo.png" width={400} alt="Elastomer Solution Logo" />
                { 
                    !codeVerificationVesibile && 
                    <EmailRequest vesibilityFunction={setCodeVerificationVesibile} token={token} email={email} setEmail={setEmail}/>
                }
                { 
                    codeVerificationVesibile && !passwordResetVesibile &&
                    <CodeVerification code={code} setCode={setCode} token={token} email={email} vesibilityFunction={setPasswordResetVesibile} />
                }
                {
                    passwordResetVesibile &&
                    <PasswordReset email={email} code={code} />
                }
            </div>
        </section>
    )
}

export default ForgotPass