const nodemailer = require('nodemailer');

exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('❌ EMAIL_USER or EMAIL_PASS not set in .env');
            return res.status(500).json({ success: false, message: 'Email service configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env' });
        }

        // Configure nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: email,
            to: 'dhairymehta122024@gmail.com',
            subject: `Smart Campus Help: ${subject} from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });

        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('Email error:', err);
        res.status(500).json({ success: false, message: 'Failed to send email. ' + err.message });
    }
};
