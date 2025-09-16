// frontend/src/components/Contact/Contact.jsx
import React, { useState } from 'react';
import { sendContactMessage, validateContactData } from '../../service/contactService';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form data
        const validation = validateContactData(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setLoading(true);
        setAlert({ show: false, type: '', message: '' });

        try {
            const response = await sendContactMessage(formData);
            
            setAlert({
                show: true,
                type: 'success',
                message: response.message || 'Your message has been sent successfully!'
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                message: ''
            });
            setErrors({});

        } catch (error) {
            setAlert({
                show: true,
                type: 'error',
                message: error.message || 'Failed to send message. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-container">
            <div className="contact-header">
                <h1 className="contact-title">Get in Touch</h1>
                <p className="contact-subtitle">
                    Have questions about our complaint tracking system? Need help with your utilities? 
                    We're here to help you every step of the way.
                </p>
            </div>

            <div className="contact-content">
                <div className="contact-info">
                    <div className="contact-info-item">
                        <div className="contact-icon email">
                            📧
                        </div>
                        <div className="contact-info-content">
                            <h3>Email</h3>
                            <p>
                                <a href="mailto:fixitfast.contact@gmail.com">
                                    fixitfast.contact@gmail.com
                                </a>
                            </p>
                            <p>We respond within 24 hours</p>
                        </div>
                    </div>

                    <div className="contact-info-item">
                        <div className="contact-icon phone">
                            📞
                        </div>
                        <div className="contact-info-content">
                            <h3>Phone</h3>
                            <p>
                                <a href="tel:+911800FIXIT1">+91 1800-FIXIT-1</a>
                            </p>
                            <p>Mon-Fri, 9 AM - 6 PM IST</p>
                        </div>
                    </div>

                    <div className="contact-info-item">
                        <div className="contact-icon address">
                            📍
                        </div>
                        <div className="contact-info-content">
                            <h3>Address</h3>
                            <p>123 Tech Park, Bangalore</p>
                            <p>Karnataka 560001, India</p>
                        </div>
                    </div>
                </div>

                <div className="contact-form">
                    <h2 className="form-title">Send Message</h2>
                    
                    {alert.show && (
                        <div className={`alert alert-${alert.type}`}>
                            {alert.type === 'success' ? '✅' : '❌'}
                            {alert.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Your Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`form-control ${errors.name ? 'error' : ''}`}
                                placeholder="Enter your full name"
                                maxLength="100"
                                disabled={loading}
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`form-control ${errors.email ? 'error' : ''}`}
                                placeholder="Enter your email address"
                                disabled={loading}
                            />
                            {errors.email && <div className="error-message">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className={`form-control ${errors.message ? 'error' : ''}`}
                                placeholder="Tell us how we can help..."
                                rows="6"
                                maxLength="1000"
                                disabled={loading}
                            />
                            {errors.message && <div className="error-message">{errors.message}</div>}
                            <small style={{color: '#7f8c8d', fontSize: '0.875rem'}}>
                                {formData.message.length}/1000 characters
                            </small>
                        </div>

                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading && <span className="loading-spinner"></span>}
                            {loading ? 'Sending Message...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;