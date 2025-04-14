// components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSignup = async () => {
    try {
      await axios.post('http://localhost:8000/auth/register', form);
      alert("Registered! Now login.");
    } catch (err) {
      alert("Signup failed.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}

export default Signup;
