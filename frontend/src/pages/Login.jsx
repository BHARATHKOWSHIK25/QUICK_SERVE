import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    // Simulate sending OTP
    setStep(2);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      alert("Please enter a 6-digit OTP");
      return;
    }
    // Instead of logging in immediately, move to step 3 to collect personal details
    setStep(3);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    // Save all details to local storage
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userAddress', address);
    
    alert('Logged in successfully!');
    navigate('/');
  };

  return (
    <div className="login-page page-wrapper">
      <div className="login-container dominos-login">
        <div className="login-header">
          <span className="logo-icon">🍽️</span>
          <h2>{step === 3 ? 'Complete Your Profile' : 'Login / Sign Up'}</h2>
          <p>
            {step === 1 && 'Enter your mobile number to continue'}
            {step === 2 && `Enter the 6-digit OTP sent to +91 ${phone}`}
            {step === 3 && 'Just a few details before you start ordering!'}
          </p>
        </div>
        
        {step === 1 && (
          <form onSubmit={handlePhoneSubmit} className="login-form">
            <div className="dominos-input-group">
              <span className="country-code">+91</span>
              <input 
                type="tel" 
                placeholder="Enter Mobile Number" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                maxLength="10"
                required 
                className="dominos-input"
              />
            </div>
            
            <button type="submit" className="btn btn-block dominos-btn">
              Submit
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="login-form">
            <div className="dominos-input-group" style={{padding: '0.2rem 1rem'}}>
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                maxLength="6"
                required 
                className="dominos-input"
                style={{letterSpacing: '0.5rem', fontSize: '1.2rem', textAlign: 'center'}}
              />
            </div>
            
            <button type="submit" className="btn btn-block dominos-btn">
              Verify OTP
            </button>

            <div className="login-footer" style={{marginTop: '1rem'}}>
              <button type="button" className="toggle-auth-btn" onClick={() => setStep(1)}>
                Change Mobile Number
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleDetailsSubmit} className="login-form">
            <div className="dominos-input-group">
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="dominos-input"
              />
            </div>

            <div className="dominos-input-group">
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="dominos-input"
              />
            </div>

            <div className="dominos-input-group">
              <input 
                type="text" 
                placeholder="City / Address Area (e.g. Brodipet)" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
                className="dominos-input"
              />
            </div>
            
            <button type="submit" className="btn btn-block dominos-btn">
              Complete Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
