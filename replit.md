# LearnFlow - AI-Powered Educational Assistant

## Overview
LearnFlow is an educational web application that provides AI-powered learning assistance for students. The app uses Google's Gemini AI to answer questions, analyze images, and provide educational content across multiple subjects.

## Recent Changes (October 12, 2025)
- **Migration to Replit Environment**: Successfully migrated from external hosting to Replit
- **APK Packaging Solution**: Created `npm run package:apk` script to properly package the app for webintoapp.com conversion (fixes "index.html not found" error permanently)
- **Database Setup**: Configured Neon Postgres database with user profiles table
- **Vite Configuration**: Updated to support Replit's iframe-based preview (port 5000, WebSocket settings)
- **TypeScript Configuration**: Added server-side TypeScript support with tsconfig.server.json
- **Firebase Integration**: Using Firebase for user authentication (Google Sign-in)
- **Server Configuration**: Express server running on port 3000 with AI chat API endpoint

## Project Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS
- **UI Components**: Radix UI components with shadcn/ui
- **Backend**: Express.js server
- **Database**: Neon Postgres with Drizzle ORM
- **Authentication**: Firebase (Google OAuth)
- **AI Service**: Google Gemini AI (with fallback responses)

### Project Structure
```
├── src/                          # Frontend React application
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── [feature components]
│   ├── pages/                   # Page components
│   ├── hooks/                   # Custom React hooks
│   ├── integrations/firebase/   # Firebase client configuration
│   └── lib/                     # Utility functions
├── server/                       # Backend Express server
│   ├── index.ts                # Main server file with API endpoints
│   ├── db.ts                   # Database connection (Neon Postgres)
│   └── shared/schema.ts        # Database schema definitions
├── public/                       # Static assets
└── [config files]               # TypeScript, Vite, Tailwind configs
```

### Key Features
1. **AI Chat Interface**: Students can ask questions via text, voice, image, or link
2. **Multi-subject Support**: General, Hindi, English, Math, Physics, Chemistry, Biology
3. **Firebase Authentication**: Secure Google Sign-in for users
4. **Request Limiting**: Rate limiting to prevent abuse (10 requests per minute)
5. **Educational Videos**: Contextual YouTube video recommendations
6. **Security Features**: Input sanitization, SSRF protection, secure image handling

### Database Schema
- **profiles table**: Stores user profile information
  - id (UUID, primary key)
  - user_id (UUID, unique)
  - display_name (text)
  - avatar_url (text)
  - created_at (timestamp)
  - updated_at (timestamp)

### API Endpoints
- `POST /api/ai-chat`: Main endpoint for AI-powered Q&A
  - Accepts: prompt (required), image (optional), linkUrl (optional)
  - Returns: AI-generated response and relevant video recommendations
  - Features: Rate limiting, input sanitization, fallback responses

### Environment Variables
- `DATABASE_URL`: Neon Postgres connection string (auto-configured by Replit)
- `GOOGLE_AI_API_KEY`: Google Gemini AI API key (optional - has fallback)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode

### Development Setup
1. **Start Development Server**: `npm run dev`
   - Runs Express server on port 3000
   - Runs Vite dev server on port 5000
2. **Package for APK Conversion**: `npm run package:apk`
   - Builds the production app
   - Creates `learnflow-apk.zip` with index.html at root
   - Ready to upload to webintoapp.com
3. **Database Operations**:
   - Push schema: `npm run db:push`
   - Generate migrations: `drizzle-kit generate`

### User Preferences
- The app is designed for non-technical students and educators
- Clean, modern UI with mobile-first responsive design
- Simple authentication flow with Google Sign-in
- Educational focus with safety features (content filtering, secure inputs)

### Security Considerations
- Input sanitization to prevent XSS attacks
- URL validation to prevent SSRF attacks
- Base64 image size limits (10MB max)
- Rate limiting per IP address
- CORS configured for specific origins
- Secure Firebase configuration

### Known Limitations
- Google AI API key is optional - fallback responses are basic educational content
- Database migrations using drizzle-kit may have SSL issues - use SQL tool instead
- HMR WebSocket configuration may show connection errors in console (doesn't affect functionality)

### Next Steps for Development
1. Implement profile management features using the profiles table
2. Add admin functionality for monitoring and moderation
3. Expand AI capabilities with more sophisticated prompts
4. Add more educational resources and video integrations
5. Implement user progress tracking and learning analytics

## Contact & Support
- App powered by Alexzo
- Contact: alexzomail@proton.me
- Website: https://alexzo.vercel.app
