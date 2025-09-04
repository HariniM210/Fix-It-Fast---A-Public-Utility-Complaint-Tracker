import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-container">
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <div className="method-icon">📧</div>
              <div>
                <h3>Email</h3>
                <p>support@fixitfast.com</p>
                <small>We respond within 24 hours</small>
              </div>
            </div>
            
            <div className="contact-method">
              <div className="method-icon">📞</div>
              <div>
                <h3>Phone</h3>
                <p>+91 1800-FIXIT-1</p>
                <small>Mon-Fri, 9 AM - 6 PM IST</small>
              </div>
            </div>
            
            <div className="contact-method">
              <div className="method-icon">📍</div>
              <div>
                <h3>Address</h3>
                <p>123 Tech Park, Bangalore</p>
                <small>Karnataka 560001, India</small>
              </div>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send Message</h2>
          
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="6"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us how we can help..."
              required
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
