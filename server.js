const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from Main UI directory
app.use(express.static(path.join(__dirname, 'Main UI')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arcade-hub-clean';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalTimeSpent: { // New field to track total time spent on main page (in seconds)
        type: Number,
        default: 0
    },
    lastActive: { // Optional: Track last activity for debugging
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '187147874687-j9kpu22o3k8dus7uj07tt6o9o3skrl6l.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid token or user not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Main UI', 'main.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Main UI', 'login.html'));
});

// User Registration
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                error: 'All fields are required',
                success: false 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                error: 'Passwords do not match',
                success: false 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters long',
                success: false 
            });
        }

        if (name.length < 2) {
            return res.status(400).json({ 
                error: 'Name must be at least 2 characters long',
                success: false 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email already exists',
                success: false 
            });
        }

        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        await user.save();

        const token = generateToken(user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: 'Email already exists',
                success: false 
            });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                error: errors.join(', '),
                success: false 
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error. Please try again.',
            success: false 
        });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required',
                success: false 
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password',
                success: false 
            });
        }

        if (!user.isActive) {
            return res.status(401).json({ 
                error: 'Account is deactivated',
                success: false 
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Invalid email or password',
                success: false 
            });
        }

        const token = generateToken(user._id);

        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            success: false 
        });
    }
});

// Google OAuth Login
app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential, userInfo } = req.body;

        if (!credential) {
            return res.status(400).json({ 
                error: 'Google credential is required',
                success: false 
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        if (!email) {
            return res.status(400).json({ 
                error: 'Email not provided by Google',
                success: false 
            });
        }

        let user = await User.findOne({ email: email.toLowerCase().trim() });

        if (user) {
            user.lastLogin = new Date();
            await user.save();
        } else {
            user = new User({
                name: name || 'Google User',
                email: email.toLowerCase().trim(),
                password: 'google-auth-' + googleId,
                lastLogin: new Date()
            });
            await user.save();
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Google authentication successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                lastLogin: user.lastLogin,
                loginMethod: 'google'
            }
        });

    } catch (error) {
        console.error('Google authentication error:', error);
        
        if (error.message.includes('Token used too early') || error.message.includes('Token used too late')) {
            return res.status(400).json({ 
                error: 'Invalid Google token',
                success: false 
            });
        }
        
        res.status(500).json({ 
            error: 'Google authentication failed',
            success: false 
        });
    }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                createdAt: req.user.createdAt,
                lastLogin: req.user.lastLogin,
                totalTimeSpent: req.user.totalTimeSpent // Include time spent
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            success: false 
        });
    }
});

// Track time spent on main page
app.post('/api/track-time', authenticateToken, async (req, res) => {
    try {
        const { timeSpent } = req.body;

        if (!timeSpent || timeSpent < 0) {
            return res.status(400).json({
                error: 'Invalid timeSpent value',
                success: false
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                success: false
            });
        }

        // Update total time and last active
        user.totalTimeSpent = (user.totalTimeSpent || 0) + timeSpent;
        user.lastActive = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Time tracked successfully',
            totalTimeSpent: user.totalTimeSpent
        });
    } catch (error) {
        console.error('Track time error:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
});

// Get top 5 users by time spent
app.get('/api/leaderboard/time', async (req, res) => {
    try {
        const topUsers = await User.find({})
            .sort({ totalTimeSpent: -1 })
            .limit(5)
            .select('name email totalTimeSpent');
        res.json({
            success: true,
            leaderboard: topUsers.map(user => ({
                name: user.name,
                email: user.email,
                timeSpent: user.totalTimeSpent
            }))
        });
    } catch (error) {
        console.error('Leaderboard time error:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
});

// Logout (client-side token removal)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        const updates = {};

        if (name && name.trim().length >= 2) {
            updates.name = name.trim();
        }

        if (email && email.trim().length > 0) {
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    error: 'Please enter a valid email',
                    success: false 
                });
            }
            
            const existingUser = await User.findOne({ 
                email: email.toLowerCase().trim(),
                _id: { $ne: req.user._id }
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    error: 'Email already exists',
                    success: false 
                });
            }
            
            updates.email = email.toLowerCase().trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ 
                error: 'No valid updates provided',
                success: false 
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt,
                lastLogin: updatedUser.lastLogin
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            success: false 
        });
    }
});

// Change password
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                error: 'All password fields are required',
                success: false 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                error: 'New passwords do not match',
                success: false 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'New password must be at least 6 characters long',
                success: false 
            });
        }

        const user = await User.findById(req.user._id);
        
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ 
                error: 'Current password is incorrect',
                success: false 
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            success: false 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Arcade Hub API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler  
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Arcade Hub Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔐 Login: http://localhost:${PORT}/login`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
});

module.exports = app;