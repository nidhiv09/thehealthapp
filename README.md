# TheHealth

TheHealth is a React Native (Expo) mobile application for health-focused onboarding, user management, and AI-assisted health insights.

This project includes an ECG-based arrhythmia classification module used to support health insights.
- Uses the MIT-BIH dataset (16K+ heartbeat segments across 5 classes)  
- Implements a CNN–LSTM architecture for temporal and spatial feature extraction  
- Achieves 75% accuracy and 0.79 weighted F1-score on multi-class classification  
- Outputs can be used for generating personalized health insights  

Note: The ML module is maintained separately and can be integrated with the backend for real-time inference.  
Refer to the backend implementation: https://github.com/anvith-1001/AIAM.git

Hardware Device Document: https://docs.google.com/document/d/1jCtjUZlMCq8EOS6rEezqeu3t8Kw1eHbKTaZjXdLoMpY/edit?usp=sharing

## Features

- User registration with multi-step onboarding
- Login and persistent auth with stored token
- Password reset with OTP flow
- Profile management for sleep schedule and health details
- Daily heart-rate summary view
- Weekly AI-generated health insights and recommendations
- Animated UI using Lottie assets

## Tech Stack

- Expo
- React Native
- React Navigation
- Axios
- Async Storage
- Lottie React Native

## Backend Dependency

This application requires a hardware device and backend API for authentication, health data processing, and AI insights generation.  
Refer to the backend implementation: https://github.com/anvith-1001/AIAM.git

Hardware Device Document: https://docs.google.com/document/d/1jCtjUZlMCq8EOS6rEezqeu3t8Kw1eHbKTaZjXdLoMpY/edit?usp=sharing

## Project Structure

```text
.
├── App.js
├── index.js
├── assets/
├── context/
│   └── AuthContext.js
├── navigation/
│   └── AppNavigator.js
├── screens/
│   ├── HomeScreen.js
│   ├── LoginScreen.js
│   ├── ProfileScreen.js
│   ├── RegisterScreen.js
│   ├── ResetPasswordScreen.js
│   └── SplashScreen.js
└── utils/
    └── api.js
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Expo Go app or Android/iOS simulator

### Install dependencies

```bash
npm install
```

### Configure the API

Update `BASE_URL` in `utils/api.js` with your backend URL:

```js
const BASE_URL = "https://your-api-url";
```

The application interacts with backend endpoints such as:

- `POST /user/register`
- `POST /user/login`
- `GET /user/me`
- `PATCH /user/update`
- `DELETE /user/delete`
- `POST /user/forgot-password/send-otp`
- `POST /user/forgot-password/verify`
- `POST /med/med/daily-summary`
- `GET /med/med/weekly-summary`
- `GET /llm/llm/weekly-report`

## Run the App

```bash
npm start
```

Platform-specific commands:

```bash
npm run android
npm run ios
npm run web
```

## App Flow

1. The app starts inside `AuthProvider`.
2. Stored auth state is restored from Async Storage.
3. Unauthenticated users see login, registration, and reset password screens.
4. Authenticated users see the home dashboard and profile screen.

## Main Screens

- `LoginScreen`: signs users in
- `RegisterScreen`: collects personal and health onboarding data
- `ResetPasswordScreen`: sends OTP and resets password
- `HomeScreen`: shows daily and weekly health summaries
- `ProfileScreen`: edits sleep schedule and health information

## Notes

- Auth tokens are stored locally with Async Storage.
- Lottie animation files are stored in `assets/animations`.
- `utils/api.js` still contains a placeholder base URL and must be configured before the app can talk to a backend.

## Scripts

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web"
}
```
