<!-- 
<p align="center">
  <img src="https://raw.githubusercontent.com/Praful0306/DreamAlpha_AiForBharat_vidhyaSetu/main/vidhyaSetu/frontend/public/favicon.ico" alt="Vidya-Setu Logo" width="120" />
</p>
-->

<h1 align="center">🌟 Vidya-Setu: AI-Powered Educational Platform for Bharat 🇮🇳</h1>

<p align="center">
  <b>Bridging the educational divide in rural India through Offline-First, Culturally Adapted AI.</b><br/>
  <i>An official submission for the AWS Global Vibe AI Coding Hackathon 2025.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AWS-Serverless-orange?style=for-the-badge&logo=amazonaws" alt="AWS Serverless" />
  <img src="https://img.shields.io/badge/Generative_AI-AWS_Bedrock-blue?style=for-the-badge&logo=amazonaws" alt="AWS Bedrock" />
  <img src="https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
</p>

---

## 🚀 The Vision: Why Vidya-Setu?

In rural India, 70% of students lack access to quality educational content in their native languages. Traditional rule-based translation systems fail to capture the cultural nuances and localized context required for active learning. 

**Vidya-Setu** leverages highly optimized **Generative AI** to solve this. We use LLMs to *transcreate* educational concepts using local examples (e.g., explaining physics concepts using a bullock cart instead of a sports car). The UI is highly accessible, built to handle intermittent 2G/3G connections, and features adaptive learning that meets the student exactly where they are.

---

## ✨ Flagship AI Features

### 🛤️ 1. Personalized AI Study Roadmap
Our custom **AWS Bedrock** pipeline analyzes a student's learning goals, available hours, and chosen exam (JEE, NEET, UPSC, or Custom) to generate a deeply personalized, week-by-week study timeline.
- **Dynamic Phasing:** Breaks down massive syllabuses into manageable weekly chunks.
- **Visual Progress:** Real-time tracking of module completion and test scores.
- **Auto-Adapting:** Adjusts recommendations if the student falls behind or excels.

### 💻 2. The AI Coding Lab 
A complete in-browser IDE with live code execution and an embedded AI Mentor.
- **No Setup Required:** Write, run, and evaluate **Python, JavaScript, Java, C++, and C** directly in the browser via an advanced Execution Proxy. Instant live-previews for **HTML & CSS**.
- **Context-Aware Problem Generation:** Bedrock dynamically generates novel coding challenges mapped exactly to the student's skill level and localized context (e.g., *“Write a function to calculate crop yield.”*).
- **"Help Me Solve" Mode:** Tabbed mentoring. The AI gives plain-English algorithmic approaches *before* showing code, forcing the student to learn logic first.
- **Expert Code Unlock:** Mentorship scaling. Students can only see the "Expert Developer" optimal solution *after* they successfully run their own code.

### 💬 3. Omni-Present AI Tutor
- **Zero Waiting:** AI generates entire customized course curriculums in seconds based on a single prompt.
- **Contextual Awareness:** The chat tutor knows exactly what module or quiz the student is looking at, providing hyper-relevant doubt resolution without the student needing to explain their context.

---

## 🏗️ 100% Serverless AWS Architecture

We built a strictly **Serverless** architecture to guarantee massive scalability at near-zero idle cost, strictly adhering to AWS well-architected patterns.

### The Backend (Python / FastAPI)
- **AWS Lambda via Mangum:** The entire FastAPI backend is wrapped statelessly using `Mangum` to run natively inside AWS Lambda functions.
- **Amazon Bedrock:** The foundational AI engine orchestrating the curricula generation and Coding Lab mental execution logic.
- **Cross-Compiled & Lightweight:** Dependencies are explicitly built for `manylinux2014_x86_64` to guarantee seamless execution on Amazon Linux inside Lambda.

### The Frontend (React 18 / Vite)
- **AWS Amplify Hosting:** Delivered globally via edge locations ensuring rapid LCP (Largest Contentful Paint) for users.
- **Offline-First & Resilient:** Utilizes heavy `localStorage` state persistence and seamless session recovery to combat dropped connections.
- **Frictionless Auth Flow:** One-click Email authentication directly mapped to local state ensuring instant access without complex multi-step verifications that cause high drop-off rates in rural demographics.
- **Glassmorphism UI:** A world-class, modern, dark-themed responsive interface. 

---

## 🏆 Hackathon Evaluation Criteria

| Question | Our Answer |
|----------|------------|
| **Why is AI Required in Our Solution?** | Adaptive learning and transcreation cannot be hard-coded. AI dynamically lowers reading levels, changes explanation strategies (tracking `failed_attempts`), and parses unstructured intent from spoken regional dialects. |
| **How are AWS Services Used?** | **Amazon Bedrock** provides the core LLM orchestration. **AWS Lambda** provides stateless microservice scaling. **AWS Amplify** handles the SPA frontend. **Amazon API Gateway** routes our REST traffic globally. |
| **What Value does AI Add?** | It solves the 1:1,000,000 teacher-to-student ratio. Students get instantaneous, dynamic curriculums and a tireless AI mentor that scales infinitely and responds natively to their cultural context. |

---

## 💻 Running the Project Locally

Clone the repository and jump right in.

### 1. Frontend Setup
```bash
cd vidhyaSetu/frontend
npm install
npm start
```

### 2. Backend Setup
```bash
cd vidhyaSetu/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 🤝 The Team DreamAlpha
Built with ❤️ for the **AWS Global AI Coding Hackathon **. 

We believe that access to personalized, culturally-aware, and cutting-edge education is a fundamental human right, not a privilege determined by zip code. Vidya-Setu is our bridge to that future. Vidya-Setu is more than a hackathon project; it is a production-ready blueprint for the future of education in the Global South. By fusing the unmatched reasoning capabilities of Amazon Bedrock with the bulletproof scalability of the AWS Serverless ecosystem, we have engineered a system that teaches, mentors, and adapts to every single student—regardless of their background, language, or bandwidth.
