# 🎮 Arcade Hub - Full Stack Gaming Platform

A complete gaming platform with Node.js backend and modern frontend featuring multiple arcade games.

## 🚀 Features

### Frontend
- **Modern UI**: Neon-themed responsive design
- **Authentication**: Login/Signup with form validation
- **Game Collection**: Multiple arcade games (Chess, Tic-Tac-Toe, Memory Match, etc.)
- **User Dashboard**: Personalized gaming experience
- **Leaderboards**: Global scoring system

### Backend
- **RESTful API**: Express.js server with MongoDB
- **Authentication**: JWT-based secure authentication
- **Password Security**: bcrypt hashing
- **User Management**: Profile management and session handling
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd "Gaming Zone"

# Install backend dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/arcade-hub

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### User Management
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### System
- `GET /api/health` - Health check

## 🎮 Available Games

1. **Bubble Shooter Pro** - Pop bubbles and score big
2. **Cascade Blocks** - Stack and match blocks
3. **Chess** - Classic strategy game
4. **Lights Out Puzzle** - Toggle grid puzzle
5. **Memory Match Pro** - Card matching game
6. **Minesweeper** - Classic mine-finding game
7. **Rock-Paper-Scissors** - Quick play mini game
8. **Tic Tac Toe** - Classic noughts and crosses
9. **Word Scramble Duel** - Word puzzle game

## 🔐 Authentication Flow

1. **First Visit**: Users see login page
2. **Registration**: New users can create accounts
3. **Login**: Existing users sign in with email/password
4. **Session**: JWT tokens maintain authentication
5. **Protected Routes**: Main UI requires authentication
6. **Logout**: Clears session and returns to login

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, validated),
  password: String (required, min 6 chars, hashed),
  createdAt: Date (default: now),
  lastLogin: Date (default: now),
  isActive: Boolean (default: true)
}
```

## 🎨 Frontend Structure

```
Main UI/
├── login.html          # Authentication page
├── main.html           # Main gaming dashboard
├── BubblesShotter/     # Game directories
├── chess/
├── memory-match-pro/
└── ... (other games)
```

## 🔧 Development

### Backend Development
```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Run in development mode
npm run dev
```

### Frontend Development
- Frontend files are served statically by Express
- No build process required
- Uses Tailwind CSS via CDN
- Vanilla JavaScript (no frameworks)

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arcade-hub
JWT_SECRET=your-production-secret-key
```

### Deployment Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Vercel**: Serverless deployment
- **DigitalOcean**: VPS deployment
- **AWS**: EC2 or Elastic Beanstalk

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request handling
- **Environment Variables**: Sensitive data protection

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive grid layouts
- **Desktop Enhanced**: Full feature set on larger screens
- **Touch Friendly**: Mobile-optimized interactions

## 🎯 Future Enhancements

- [ ] Social login (Google, Facebook)
- [ ] Email verification
- [ ] Password reset functionality
- [ ] User avatars and profiles
- [ ] Game statistics and achievements
- [ ] Multiplayer game support
- [ ] Real-time leaderboards
- [ ] Push notifications

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB service is running
   - Verify connection string in `.env`
   - Ensure network access (for Atlas)

2. **JWT Token Errors**
   - Check JWT_SECRET is set
   - Verify token expiration
   - Clear localStorage and re-login

3. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing process: `lsof -ti:3000 | xargs kill`

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Check server logs for errors

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

**Happy Gaming! 🎮**
# ARCADE-HUB
# ARCADE-HUB
