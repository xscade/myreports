# MedReports AI - Medical Report Dashboard

A comprehensive medical report analysis dashboard built with Next.js, ShadCN UI, Framer Motion, MongoDB, and Google Gemini AI.

![Dashboard Preview](screenshots/dashboard.png)

## Features

- 🔐 **User Authentication** - Register/Login with secure password hashing (bcrypt) and JWT tokens
- 📊 **Dashboard** - Overview of health stats and quick actions
- 📤 **AI Document Extraction** - Upload medical documents (images/PDFs) and extract lab parameters using Google Gemini AI
- 📋 **Data Table** - View, filter, and export extracted lab parameters
- 📈 **Analytics** - Visualize trends with interactive charts
- 🌗 **Dark/Light Mode** - Wednesday-inspired purple theme
- 💾 **MongoDB Storage** - Persistent data storage with MongoDB Atlas
- 🔄 **Duplicate Prevention** - Automatically skips duplicate lab parameters

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Components:** ShadCN UI + Radix UI
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Charts:** Recharts
- **State Management:** Zustand
- **AI:** Google Gemini 1.5 Flash
- **Database:** MongoDB Atlas (Mongoose)
- **Authentication:** JWT + bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API Key
- MongoDB Atlas account

### Installation

1. Clone the repository:
```bash
cd "My Reports With AI"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with:
```bash
# Google Gemini API Key
# Get it from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Atlas Connection URI
# Get it from: https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/medical-reports?retryWrites=true&w=majority

# JWT Secret (Use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setting Up MongoDB Atlas

1. Visit [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account or sign in
3. Create a new cluster (free tier available)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<username>`, `<password>`, and `<dbname>` in the URI
8. Add the URI to your `.env.local` file

### Database Structure

**Users Collection:**
- `email` - User's email (unique)
- `password` - Hashed password
- `name` - User's display name
- `createdAt`, `updatedAt` - Timestamps

**LabParameters Collection:**
- `userId` - Reference to user
- `parameterName` - Lab parameter name
- `value` - Test value
- `unit` - Unit of measurement
- `normalRange` - Reference range
- `status` - Low/Normal/High
- `testDate` - Date of the test
- `sourceFile` - Original filename
- `extractedAt` - Extraction timestamp

## Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env.local` file

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account
- `POST /api/auth/logout` - Logout (clears cookie)
- `GET /api/auth/me` - Get current user

### Lab Parameters
- `GET /api/lab-parameters` - Get all parameters for user
- `POST /api/lab-parameters` - Add new parameters
- `DELETE /api/lab-parameters` - Delete all parameters
- `DELETE /api/lab-parameters/[id]` - Delete specific parameter

### AI Extraction
- `POST /api/extract` - Extract data from uploaded file

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/               # Authentication endpoints
│   │   ├── extract/            # Gemini API endpoint
│   │   └── lab-parameters/     # CRUD endpoints
│   ├── dashboard/
│   │   ├── analytics/          # Charts & visualizations
│   │   ├── settings/           # User settings
│   │   ├── table/              # Data table view
│   │   ├── upload/             # File upload & AI extraction
│   │   ├── layout.tsx          # Dashboard layout
│   │   └── page.tsx            # Dashboard home
│   ├── login/                  # Login page
│   ├── globals.css             # Global styles & theme
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── layout/                 # Layout components (sidebar, navbar)
│   ├── pages/                  # Page content components
│   ├── providers/              # Context providers
│   └── ui/                     # ShadCN UI components
├── lib/
│   ├── auth.ts                 # JWT utilities
│   ├── mongodb.ts              # Database connection
│   └── utils.ts                # Utility functions
├── models/
│   ├── User.ts                 # User model
│   └── LabParameter.ts         # Lab parameter model
├── store/
│   └── app-store.ts            # Zustand store
└── types/
    └── index.ts                # TypeScript types
```

## AI Extraction Schema

The Gemini AI extracts the following data from medical documents:

```typescript
interface LabParameter {
  id: string;
  parameterName: string;    // e.g., "Hemoglobin", "WBC Count"
  value: string;            // e.g., "14.2", "8500"
  unit: string;             // e.g., "g/dL", "cells/mcL"
  normalRange: string;      // e.g., "12.0-16.0"
  status: 'Low' | 'Normal' | 'High';
  testDate: string;         // YYYY-MM-DD format
  sourceFile: string;       // Original filename
  extractedAt: string;      // ISO timestamp
}
```

## Theme

The app uses a Wednesday-inspired purple theme:

- **Primary Purple:** #7c3aed (--purple-600)
- **Dark Purple:** #6d28d9 (--purple-700)
- **Light Purple:** #a78bfa (--purple-400)

## Security Features

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens stored in HTTP-only cookies
- MongoDB compound indexes prevent duplicate data
- Server-side authentication checks on all API routes

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
