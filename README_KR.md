
# 🩺 Re:Boot (리부트) - 마음과 커리어의 재부팅

> **"누구나 다시 시작할 수 있습니다."**  
> Re:Boot는 바쁜 현대인들이 잃어버린 신체적, 정신적 균형을 되찾도록 돕는 **AI 기반 개인화 웰니스 코칭 솔루션**입니다.

---

## 📖 프로젝트 개요

현대인들은 만성적인 스트레스, 번아웃, 원인 모를 신체 통증에 시달리지만, 병원에 갈 시간조차 부족하거나 막연한 두려움으로 관리를 미루곤 합니다.

**Re:Boot**는 사용자의 증상과 심리 상태를 분석하여 **의학적/심리학적 근거(행동 활성화 이론)**에 기반한 **'마이크로 액션(Micro Action)'**과 **'건강 분석 리포트'**를 제공합니다. Google Gemini의 강력한 추론 능력을 활용하여 단순한 위로를 넘어, 실질적인 호르몬 및 신경 전달 물질 경향성까지 분석하여 회복을 돕습니다.

## ✨ 주요 기능

### 1. 🤖 AI 웰니스 코치 (Gemini 2.5 / 3.0)
- **실시간 증상 상담**: 사용자의 신체 통증이나 정신적 불안을 자연어(또는 사진)로 입력하면, AI가 즉각적으로 분석합니다.
- **맞춤형 분석**: 
  - **Health Insight**: 증상의 원인을 메커니즘 관점에서 설명 (예: 스트레스로 인한 코르티솔 증가가 승모근 경직 유발).
  - **영양 및 의약 가이드**: 현재 상태에 필요한 영양소 및 일반 의약품(OTC) 제안.
  - **재활 및 행동 처방**: 즉시 실천 가능한 스트레칭이나 호흡법 안내.
- **스트리밍 응답**: 끊김 없는 대화 경험을 제공합니다.

### 2. ✅ 마이크로 액션 (Micro Actions)
- **행동 활성화 이론 적용**: 거창한 목표 대신, 1분 안에 완료할 수 있는 작은 행동(예: 물 마시기, 창문 열기)을 제안하여 무기력증을 극복합니다.
- **카테고리별 관리**: 건강(Health), 커리어(Career), 루틴(Routine), 멘탈(Mental)로 나누어 균형 잡힌 성장을 돕습니다.
- **성취 시각화**: 체크리스트 완료 시 진행률 바와 격려 메시지를 제공합니다.

### 3. 📊 심층 분석 리포트 (Deep Dive Report)
- **회복 탄력성 차트**: 사용자의 기분과 에너지 흐름을 주/월/년 단위 그래프로 시각화합니다.
- **건강 캘린더 (Heatmap)**: 매일의 달성률을 신호등 색상(🟢/🟡/🔴)으로 표시하여 습관 형성을 돕습니다.
- **Medical & Mind Insight**: AI가 대화 맥락을 기억하여 호르몬 경향성(도파민, 세로토닌 등)과 스트레스 수준을 추적 분석합니다.

### 4. 🔒 프라이버시 중심 설계 (Local-First)
- **로컬 데이터 저장**: 민감한 건강 데이터는 서버에 저장되지 않고 사용자의 브라우저(LocalStorage)에만 안전하게 저장됩니다.
- **백업 및 복구**: JSON 파일 형태로 데이터를 백업하고 언제든 복구할 수 있습니다.

### 5. 🌏 다국어 지원
- 한국어 및 영어를 완벽하게 지원하며, 실시간으로 언어 전환이 가능합니다.

---

## 🛠 기술 스택

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini API (`gemini-2.5-flash`, `gemini-3.0-pro`)
- **State Management**: React Hooks & Context API 패턴
- **Visualization**: Recharts
- **Storage**: Browser LocalStorage / SessionStorage

---

## 🚀 시작하기 (Getting Started)

### 1. 사전 준비
이 프로젝트는 Google Gemini API Key가 필요합니다. [Google AI Studio](https://aistudio.google.com/)에서 키를 발급받으세요.

### 2. 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/reboot-app.git

# 디렉토리 이동
cd reboot-app

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
# REACT_APP_GEMINI_API_KEY=your_api_key_here
# (또는 번들러 설정에 따라 process.env.API_KEY 주입 필요)

# 개발 서버 실행
npm start
```

---

## ⚠️ 면책 조항 (Disclaimer)

**Re:Boot**는 의학적 진단, 치료, 치료법을 제공하는 의료 기기가 아닙니다. 
본 서비스가 제공하는 정보는 참고용이며, 실제 건강 문제는 반드시 전문 의료진과 상의해야 합니다.

---

## 📝 라이선스

This project is licensed under the MIT License.
