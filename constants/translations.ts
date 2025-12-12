
import { Language } from "../types";

export const translations = {
  ko: {
    appTitle: "Re:Boot",
    appSubtitle: "마음과 커리어의 재부팅",
    poweredBy: "Powered by",
    reportButton: "리포트 보기",
    reportTitle: "심층 분석 리포트",
    reportSubtitle: "님의 회복 탄력성 및 활동 데이터 분석",
    chartTitle: "회복 탄력성 추이 (Mood & Energy)",
    
    // Chart Enhancements
    chartRangeWeek: "1주",
    chartRangeMonth: "1개월",
    chartRangeYear: "1년",
    chartDescTitle: "📊 그래프 해석 가이드",
    chartDescTrendUp: "📈 상승세: 회복 탄력성이 좋아지고 있습니다. 현재의 루틴을 유지하세요.",
    chartDescTrendDown: "📉 하락세: 에너지가 고갈되고 있습니다. 휴식과 수면을 최우선으로 두세요.",
    chartDescTrendStable: "➡️ 안정세: 감정과 에너지가 균형을 이루고 있습니다. 아주 좋습니다.",
    chartDescVolatile: "〰️ 변동성 심함: 감정 기복이 큽니다. 규칙적인 식사와 수면으로 리듬을 잡아주세요.",

    // Health Guide
    healthGuideTitle: "맞춤형 건강 가이드",
    healthGuideTip: "💡 오늘의 건강 팁",
    
    // Medical Section -> Renamed to Mind & Stress
    medicalTitle: "마음 & 스트레스 분석 (Mind Insight)",
    medicalHormone: "신경 전달 물질 경향성",
    medicalAdvice: "심리 코칭 어드바이스",
    medicalNutrition: "영양 및 케어 (Nutrition & Care)",
    
    // Career Section
    careerTitle: "커리어 재부팅 로드맵",
    careerActionTitle: "지금 당장 시도할 구체적 전략",
    careerGig: "긱 이코노미 적합도",
    careerSolo: "창직(1인 개발) 잠재력",
    careerStress: "직무 스트레스 내성",
    
    // Health Calendar
    healthCalendarTitle: "건강 신호등",
    signalGood: "양호",
    signalCaution: "주의",
    signalWarning: "경고",
    monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    daysShort: ['일', '월', '화', '수', '목', '금', '토'],

    // Checklist Widget
    dailyGuideTitle: "오늘의 맞춤 가이드",
    checklistEmptyTitle: "체크리스트 없음",
    checklistEmptyDescToday: "AI 코치와 대화하여 오늘의 맞춤형 가이드를 받아보세요.",
    checklistEmptyDescPast: "이 날짜에는 기록된 가이드가 없습니다.",
    checklistAchieved: "달성",
    checklistEncouragement: "오늘의 목표를 완료하여 초록불을 켜보세요!",
    
    // Onboarding
    onboardingTitle: "Re:Boot 시작하기",
    onboardingDesc: "누구나 다시 시작할 수 있습니다.\n당신의 이야기를 들려주세요.",
    labelName: "이름 (또는 닉네임)",
    placeholderName: "예: 김리부트",
    labelAge: "나이",
    placeholderAge: "예: 30",
    labelJob: "현재 직업 / 상태",
    labelJobDesc: "* '실직'은 최근 퇴사 후 재취업을 고민하는 경우, '은퇴'는 정년 이후, '무직'은 당분간 구직 의사가 없거나 휴식 중인 경우를 선택해주세요.",
    labelPhysical: "현재 가장 불편한 신체 부위나 통증이 있나요?",
    placeholderPhysical: "예: 목과 어깨가 뻐근해요 / 없음",
    labelMental: "요즘 마음 상태는 어떠신가요?",
    placeholderMental: "예: 미래가 불안해요 / 번아웃이 온 것 같아요",
    labelStress: "현재 스트레스 지수",
    stressLow: "편안함",
    stressMid: "보통",
    stressHigh: "극심함",
    btnNext: "다음 단계로",
    btnPrev: "이전",
    btnStart: "리부트 시작하기",
    
    // Restore Section (NEW)
    restoreTitle: "데이터 복구 옵션",
    btnRestoreJson: "백업파일 복원 (.json)",
    btnLoadDemo: "데모 데이터 로드 (7일)",
    confirmLoadDemo: "데모 데이터를 로드하면 기존 데이터는 모두 삭제됩니다. 계속하시겠습니까?",

    // Job Options
    jobGroupEco: "경제 활동 중",
    jobEmployee: "직장인 (회사원)",
    jobBusiness: "사업가 / 자영업자",
    jobFreelancer: "프리랜서 / N잡러",
    jobGroupStudy: "학업 및 준비",
    jobStudent: "학생 (초/중/고/대)",
    jobSeeking: "취업 준비생 (신입)",
    jobGroupRest: "변화 및 휴식",
    jobLoss: "실직 / 퇴사 (경력직 재취업 희망)",
    jobRetired: "은퇴 (시니어)",
    jobUnemployed: "무직 (휴식 및 탐색기)",
    jobHomemaker: "전업주부",
    jobOther: "기타",

    // Chat
    me: "나",
    coach: "Re:Boot 코치",
    inputPlaceholder: "오늘 하루는 어땠나요? (Shift+Enter로 줄바꿈)",
    imgUpload: "사진을 보냈습니다.",
    errorGen: "죄송합니다. 응답을 생성할 수 없습니다.",
    errorCommon: "죄송합니다. 오류가 발생했습니다.",
    btnRetry: "재시도",
    msgCancelled: "생성이 취소되었습니다.", // NEW
    groundingTitle: "참고 자료 (Deep Dive)",
    suggestedLabel: "💡 이어서 질문하기",
    welcomeBack: (name: string) => `안녕하세요, ${name}님. 다시 오셨군요! \n그동안 별일 없으셨나요? 저장된 기록을 바탕으로 대화를 이어갈게요.`,
    systemModelChange: (model: string) => `💡 AI 모델이 '${model}'로 변경되었습니다.`,
    disclaimer: "본 서비스는 의학적 진단 및 치료를 대신할 수 없습니다. 건강 관련 결정은 반드시 전문의와 상의하세요.",
    medicalWarningShort: "⚠️ AI 정보는 참고용이며 의학적 진단이 아닙니다.",

    // Action Card
    goalAchieved: "🎉 모든 목표를 달성했어요! 정말 대단해요!",
    percentAchieved: "달성",
    difficultyEasy: "쉬움",
    difficultyMedium: "보통",
    difficultyHard: "도전",

    // Reset Profile
    accountSettings: "계정 설정",
    btnReset: "초기화",
    btnBackup: "데이터 백업", // NEW
    btnRestore: "데이터 복구", // NEW
    startOver: "(처음으로)",
    resetConfirm: "정말 프로필과 대화 기록을 모두 삭제하고 처음으로 돌아가시겠습니까?",
    noDataForDate: "해당 날짜에는 기록된 데이터가 없습니다.",

    // History Sidebar
    historyTitle: "지난 대화 기록",
    historyEmpty: "저장된 대화 기록이 없습니다.",
    btnDelete: "삭제",
    btnHistory: "기록"
  },
  en: {
    appTitle: "Re:Boot",
    appSubtitle: "Reboot Your Mind & Career",
    poweredBy: "Powered by",
    reportButton: "View Report",
    reportTitle: "Deep Dive Report",
    reportSubtitle: "'s Resilience & Activity Analysis",
    chartTitle: "Resilience Trend (Mood & Energy)",
    
    // Chart Enhancements
    chartRangeWeek: "1 Week",
    chartRangeMonth: "1 Month",
    chartRangeYear: "1 Year",
    chartDescTitle: "📊 Analysis Guide",
    chartDescTrendUp: "📈 Upward: Resilience is improving. Keep up the routine.",
    chartDescTrendDown: "📉 Downward: Energy is depleting. Prioritize rest.",
    chartDescTrendStable: "➡️ Stable: Good balance of emotion and energy.",
    chartDescVolatile: "〰️ Volatile: High emotional fluctuation. Regulate sleep & diet.",
    
    // Health Guide
    healthGuideTitle: "Custom Health Guide",
    healthGuideTip: "💡 Today's Tip",

    // Medical Section -> Renamed to Mind & Stress
    medicalTitle: "Mind & Stress Insight",
    medicalHormone: "Neuro-Trend Projection",
    medicalAdvice: "Psychological Coaching",
    medicalNutrition: "Nutrition & Care",

    // Career Section
    careerTitle: "Career Reboot Roadmap",
    careerActionTitle: "Concrete Actions to Take Now",
    careerGig: "Gig Economy Fit",
    careerSolo: "Solo Creator Potential",
    careerStress: "Stress Tolerance",

    // Health Calendar
    healthCalendarTitle: "Health Calendar",
    signalGood: "Good",
    signalCaution: "Caution",
    signalWarning: "Warning",
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    // Checklist Widget
    dailyGuideTitle: "Daily Guide",
    checklistEmptyTitle: "No Checklist",
    checklistEmptyDescToday: "Chat with AI Coach to get today's guide.",
    checklistEmptyDescPast: "No guide recorded for this date.",
    checklistAchieved: "Done",
    checklistEncouragement: "Complete goals to turn the light green!",

    // Onboarding
    onboardingTitle: "Start Re:Boot",
    onboardingDesc: "Anyone can start over.\nTell us your story.",
    labelName: "Name (or Nickname)",
    placeholderName: "e.g., Alex",
    labelAge: "Age",
    placeholderAge: "e.g., 30",
    labelJob: "Current Job / Status",
    labelJobDesc: "* Select 'Job Loss' for recent layoffs, 'Retired' for seniors, 'Unemployed' for resting/exploring.",
    labelPhysical: "Any physical pain or discomfort?",
    placeholderPhysical: "e.g., Stiff neck and shoulders / None",
    labelMental: "How is your mental state lately?",
    placeholderMental: "e.g., Anxious about future / Feeling burned out",
    labelStress: "Current Stress Level",
    stressLow: "Calm",
    stressMid: "Normal",
    stressHigh: "Severe",
    btnNext: "Next Step",
    btnPrev: "Previous",
    btnStart: "Start Re:Boot",
    
    // Restore Section (NEW)
    restoreTitle: "Data Restore Options",
    btnRestoreJson: "Restore Backup (.json)",
    btnLoadDemo: "Load Demo Data (7 Days)",
    confirmLoadDemo: "Loading demo data will clear existing data. Continue?",

    // Job Options
    jobGroupEco: "Economically Active",
    jobEmployee: "Employee",
    jobBusiness: "Business Owner / Self-employed",
    jobFreelancer: "Freelancer",
    jobGroupStudy: "Education",
    jobStudent: "Student",
    jobSeeking: "Job Seeker",
    jobGroupRest: "Transition & Rest",
    jobLoss: "Job Loss / Resignation",
    jobRetired: "Retired",
    jobUnemployed: "Unemployed / Resting",
    jobHomemaker: "Homemaker",
    jobOther: "Other",

    // Chat
    me: "Me",
    coach: "Re:Boot Coach",
    inputPlaceholder: "How was your day? (Shift+Enter for new line)",
    imgUpload: "Sent a photo.",
    errorGen: "Sorry, I cannot generate a response.",
    errorCommon: "Sorry, an error occurred.",
    btnRetry: "Retry",
    msgCancelled: "Generation cancelled.", // NEW
    groundingTitle: "References (Deep Dive)",
    suggestedLabel: "💡 Suggested Questions",
    welcomeBack: (name: string) => `Welcome back, ${name}! \nHow have you been? I'll continue based on our past records.`,
    systemModelChange: (model: string) => `💡 AI Model changed to '${model}'.`,
    disclaimer: "This service provides information for reference only and does not replace professional medical diagnosis or treatment.",
    medicalWarningShort: "⚠️ AI info is not a medical diagnosis.",

    // Action Card
    goalAchieved: "🎉 All goals achieved! Amazing work!",
    percentAchieved: "Done",
    difficultyEasy: "Easy",
    difficultyMedium: "Medium",
    difficultyHard: "Hard",

    // Reset Profile
    accountSettings: "Account Settings",
    btnReset: "Reset",
    btnBackup: "Backup Data", // NEW
    btnRestore: "Restore Data", // NEW
    startOver: "(Start Over)",
    resetConfirm: "Are you sure you want to delete your profile and chat history? This cannot be undone.",
    noDataForDate: "No data recorded for this date.",

    // History Sidebar
    historyTitle: "Conversation History",
    historyEmpty: "No saved history yet.",
    btnDelete: "Delete",
    btnHistory: "History"
  }
};

export const getTranslation = (lang: Language) => {
    return translations[lang] || translations['ko'];
};
