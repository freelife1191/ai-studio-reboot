
# 🩺 Re:Boot - Reboot Your Mind & Career

> **"Anyone can start over."**  
> Re:Boot is an **AI-powered personalized wellness coaching solution** designed to help modern professionals restore their physical and mental balance.

---

## 📖 Project Overview

Modern life often comes with chronic stress, burnout, and unexplained physical pain. Yet, many people delay care due to lack of time or vague anxiety about visiting a doctor.

**Re:Boot** analyzes your symptoms and psychological state to provide **"Micro Actions"** and **"Health Insight Reports"** based on **medical/psychological principles (Behavioral Activation Theory)**. Leveraging the reasoning capabilities of Google Gemini, it goes beyond simple comfort to analyze hormonal trends and neurotransmitter patterns to aid your recovery.

## ✨ Key Features

### 1. 🤖 AI Wellness Coach (Gemini 2.5 / 3.0)
- **Real-time Consultation**: Describe your physical pain or mental anxiety in natural language (or upload a photo), and the AI analyzes it instantly.
- **Personalized Insights**:
  - **Health Insight**: Explains the mechanism of symptoms (e.g., "High cortisol levels due to stress are causing trapezius stiffness").
  - **Nutrition & Pharma Guide**: Suggests necessary nutrients and Over-The-Counter (OTC) options.
  - **Rehab & Action Prescription**: Provides actionable stretches or breathing exercises.
- **Streaming Responses**: Offers a seamless and fast conversational experience.

### 2. ✅ Micro Actions
- **Behavioral Activation**: Instead of grand goals, it suggests small tasks completeable in under 1 minute (e.g., "Drink water", "Open a window") to overcome learned helplessness.
- **Categorized Management**: Balances growth across Health, Career, Routine, and Mental categories.
- **Visual Achievement**: Provides progress bars and encouraging feedback upon checklist completion.

### 3. 📊 Deep Dive Report
- **Resilience Chart**: Visualizes mood and energy trends over weekly, monthly, and yearly graphs.
- **Health Calendar (Heatmap)**: Displays daily completion rates with traffic light colors (🟢/🟡/🔴) to encourage habit formation.
- **Medical & Mind Insight**: The AI remembers conversational context to track stress levels and hormonal tendencies (Dopamine, Serotonin, etc.).

### 4. 🔒 Privacy-First Architecture (Local-First)
- **Local Data Storage**: Sensitive health data is **not stored on a server** but securely kept only in your browser's LocalStorage.
- **Backup & Restore**: Supports data export/import via JSON files.

### 5. 🌏 Multilingual Support
- Fully supports Korean and English with real-time switching capabilities.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini API (`gemini-2.5-flash`, `gemini-3.0-pro`)
- **State Management**: React Hooks & Context API Pattern
- **Visualization**: Recharts
- **Storage**: Browser LocalStorage / SessionStorage

---

## 🚀 Getting Started

### 1. Prerequisites
You need a Google Gemini API Key. Get one at [Google AI Studio](https://aistudio.google.com/).

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/reboot-app.git

# Navigate to directory
cd reboot-app

# Install dependencies
npm install

# Configure Environment Variables (Create .env file)
# REACT_APP_GEMINI_API_KEY=your_api_key_here
# (Ensure process.env.API_KEY is properly injected based on your bundler)

# Run Development Server
npm start
```

---

## ⚠️ Disclaimer

**Re:Boot** is not a medical device and does not provide medical diagnosis, treatment, or cure.
The information provided by this service is for reference only. Always consult a professional healthcare provider for medical issues.

---

## 📝 License

This project is licensed under the MIT License.
