import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "How do I submit an assignment?",
        answer: "Navigate to the Assignments section in your student dashboard. Click on the 'View Details' of the assignment you wish to submit, and use the upload section to attach your PDF solution."
    },
    {
        question: "Can I edit a post in the Community Feed?",
        answer: "Currently, you can create and delete posts. Editing functionality is coming soon in a future update."
    },
    {
        question: "How does the NetOwe system work?",
        answer: "NetOwe allows you to track shared expenses with your peers. You can create groups, add expenses, and the system automatically calculates who owes whom."
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we use industry-standard encryption and security practices to ensure your personal information and campus data remain private and secure."
    },
    {
        question: "Who can see my profile?",
        answer: "Your profile is visible to faculty and other registered students on the platform to facilitate campus collaboration."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50, background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', marginBottom: 15 }}>
                    <HelpCircle size={30} color="#3b82f6" />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>Frequently Asked Questions</h1>
                <p style={{ color: 'var(--text-muted)' }}>Everything you need to know about the Smart Campus Companion.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            style={{
                                width: '100%',
                                padding: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>{faq.question}</span>
                            {openIndex === index ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                        </button>

                        <div style={{
                            maxHeight: openIndex === index ? '500px' : '0',
                            opacity: openIndex === index ? 1 : 0,
                            transform: openIndex === index ? 'translateY(0)' : 'translateY(-10px)',
                            overflow: 'hidden',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: 'rgba(22, 163, 74, 0.02)'
                        }}>
                            <div style={{
                                padding: '0 20px 20px',
                                color: 'var(--text-muted)',
                                fontSize: '15px',
                                lineHeight: 1.7,
                                transition: 'opacity 0.3s ease',
                                opacity: openIndex === index ? 1 : 0
                            }}>
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
