import React, { useState } from 'react';
import axios from 'axios';
import { assets } from '../assets/assets';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/contact', { name, email, message });
      
      // Set message with green color for success
      setResponseMessage(
        <p className="mt-4 text-green-600 text-center">{response.data.message}</p>
      );

      setName('');
      setEmail('');
      setMessage(''); // Reset form
    } catch (error) {
      // Set message with red color for error
      setResponseMessage(
        <p className="mt-4 text-red-600 text-center">Failed to send message. Please try again later.</p>
      );
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold text-center">Contact Us</h1>
      <p className="mt-4 text-lg text-center">We'd love to hear from you! Please fill out the form below.</p>
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-4 border rounded-lg"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-4 border rounded-lg"
            required
          />
        </div>
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-4 p-4 border rounded-lg w-full"
          rows="4"
          required
        />
        <button type="submit" className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700">
          Send Message
        </button>
      </form>
      {responseMessage && <p className='mt-4 text-center'>{responseMessage}</p>}
    </div>
  );
};

export default Contact;
