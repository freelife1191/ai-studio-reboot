
import { UserContext, DailySummary, DailyChecklist, MemoryLog, Language, MicroAction, MedicalAnalysisData, CustomGuideItem, RichDetail } from './types';

/**
 * 🚀 초기 프로필: 만성 통증과 불안을 겪는 사용자
 */
export const INITIAL_PROFILE_KO: UserContext = {
  name: "김리부트",
  age: "32",
  jobStatus: "seeking", 
  physicalStatus: "왼쪽 견갑골 안쪽이 찢어지는 듯이 아프고, 자고 일어나도 맞은 것처럼 온몸이 무거움.",
  mentalStatus: "미래가 보이지 않아 숨이 턱 막히는 불안감. 아무것도 할 수 없을 것 같은 학습된 무기력.",
  stressLevel: 9, 
  moodHistory: [
    { date: "15일전", score: 6 }, { date: "14일전", score: 5 }, { date: "13일전", score: 6 }, { date: "12일전", score: 5 },
    { date: "11일전", score: 4 }, { date: "10일전", score: 4 }, { date: "9일전", score: 3 }, { date: "8일전", score: 3 },
    { date: "7일전", score: 2 }, 
    { date: "6일전", score: 3 }, { date: "5일전", score: 2 }, { date: "4일전", score: 2 }, { date: "3일전", score: 1 },
    { date: "2일전", score: 2 }, { date: "1일전", score: 2 }, { date: "오늘", score: 1 }
  ],
  language: "ko"
};

export const INITIAL_PROFILE_EN: UserContext = {
  name: "Alex Reboot",
  age: "32",
  jobStatus: "seeking", 
  physicalStatus: "Severe stabbing pain in the inner left scapula. Waking up feels like being beaten all over.",
  mentalStatus: "Suffocating anxiety about the future. Learned helplessness preventing any action.",
  stressLevel: 9, 
  moodHistory: [
    { date: "15 days ago", score: 6 }, { date: "14 days ago", score: 5 }, { date: "13 days ago", score: 6 }, { date: "12 days ago", score: 5 },
    { date: "11 days ago", score: 4 }, { date: "10 days ago", score: 4 }, { date: "9 days ago", score: 3 }, { date: "8 days ago", score: 3 },
    { date: "7 days ago", score: 2 }, { date: "6 days ago", score: 3 }, { date: "5 days ago", score: 2 }, { date: "4 days ago", score: 2 },
    { date: "3 days ago", score: 1 }, { date: "2 days ago", score: 2 }, { date: "1 days ago", score: 2 }, { date: "Today", score: 1 }
  ],
  language: "en"
};

const getRelativeDate = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --------------------------------------------------------------------------
// 📚 RICH DETAIL DATABASE (Expanded for Procedural Scenarios)
// --------------------------------------------------------------------------
type DetailDB = Record<string, { ko: RichDetail; en: RichDetail }>;

const RICH_DETAILS_DB: DetailDB = {
    // --- ORIGINAL DEMO ITEMS (DO NOT TOUCH) ---
    "cortisol": {
        ko: {
            background: "[코르티솔과 통증] 스트레스 호르몬인 코르티솔 수치가 높으면 근육 단백질 분해가 촉진되고 염증 반응이 일어납니다. 특히 승모근과 능형근은 스트레스에 가장 민감하게 반응하여 딱딱하게 굳는 방어 기제(Muscle Guarding)를 작동시킵니다.",
            guideSteps: ["현재 상태를 '질병'이 아닌 '신호'로 인식하세요.", "통증 부위에 호흡을 불어넣는다는 느낌으로 이완합니다.", "교감신경 항진을 낮추기 위해 행동 속도를 0.5배 늦추세요."],
            doctorComment: "지금의 통증은 몸이 고장 난 것이 아니라, 뇌가 '강제 휴식'을 명령하고 있는 것입니다. 싸우려 하지 말고 받아들이세요.",
            expectedEffect: "근육 긴장도 감소 및 심리적 안정"
        },
        en: {
            background: "[Cortisol & Pain] High cortisol levels accelerate muscle protein breakdown and inflammation. Trapezius and rhomboids are stress-sensitive, entering a state of 'Muscle Guarding'.",
            guideSteps: ["View your condition as a 'Signal', not a 'Disease'.", "Visualize breathing into the painful area.", "Slow down your actions by 50%."],
            doctorComment: "Your body isn't broken; your brain is ordering 'Forced Rest'. Don't fight it, accept it.",
            expectedEffect: "Reduced muscle tension & mental calm"
        }
    },
    "adrenaline": { 
        ko: {
            background: "[야간 각성] 아드레날린은 '투쟁-도피' 호르몬입니다. 밤에도 이 수치가 높다는 것은 뇌가 침대를 '전장'으로 인식한다는 뜻입니다. 이 상태에서는 깊은 잠(NREM)에 들 수 없습니다.",
            guideSteps: ["잠들기 1시간 전, 따뜻한 카모마일 차를 마시세요(아피제닌 성분이 신경 안정).", "조명을 끄고 스마트폰을 멀리 두세요.", "내일 할 일 목록을 종이에 적어두고 잊으세요."],
            doctorComment: "잠을 못 자는 것에 대해 화를 내면 아드레날린이 더 분비됩니다. '그냥 누워만 있어도 휴식이다'라고 생각하세요.",
            expectedEffect: "입면 시간 단축 및 수면 질 개선"
        },
        en: {
            background: "[Nocturnal Arousal] Adrenaline is the 'Fight or Flight' hormone. High levels at night mean your brain views the bed as a battlefield.",
            guideSteps: ["Drink warm Chamomile tea 1hr before bed (Apigenin promotes calm).", "Dim lights and hide your phone.", "Write down tomorrow's tasks to offload your brain."],
            doctorComment: "Getting angry about insomnia spikes adrenaline. Tell yourself, 'Lying down is rest enough'.",
            expectedEffect: "Faster sleep onset & better sleep quality"
        }
    },
    "dopamine": { 
        ko: {
            background: "[보상 회로 차단] 장기간의 무기력은 도파민 수용체의 감도 저하를 의미합니다. 거창한 목표는 오히려 부담이 됩니다. 뇌는 '예측 가능한 아주 작은 성공'에서 도파민을 얻습니다.",
            guideSteps: ["'이불 개기'나 '창문 열기' 같은 1분 미만의 행동을 합니다.", "완료 즉시 '잘했어'라고 소리 내어 칭찬합니다.", "성취감을 5초간 음미하세요."],
            doctorComment: "의욕이 있어서 행동하는 것이 아니라, 행동을 해야 의욕이 생깁니다. 이 순서를 기억하세요.",
            expectedEffect: "무기력감 해소 및 동기 부여"
        },
        en: {
            background: "[Reward Circuit Blockage] Long-term helplessness reduces dopamine sensitivity. The brain gets dopamine hits from 'Predictable Micro-Successes', not grand goals.",
            guideSteps: ["Do a <1 min task like 'Make the bed'.", "Say 'Good job' immediately after.", "Savor the achievement for 5 seconds."],
            doctorComment: "Action precedes motivation. You don't act because you feel like it; you feel like it because you acted.",
            expectedEffect: "Lifted mood & motivation boost"
        }
    },
    "early_stress": { 
        ko: {
            background: "[긴장성 반응] 심리적 부담감이 신체 근육의 긴장으로 전환되는 초기 단계입니다. 이때 풀어주지 않으면 만성 통증으로 발전할 수 있습니다.",
            guideSteps: ["매시간 알람을 맞추고 어깨를 으쓱였다가 툭 떨어뜨리세요.", "비타민 C가 풍부한 과일이나 음료를 섭취하세요.", "일과 중 5분 스트레칭 시간을 확보하세요."],
            doctorComment: "몸이 보내는 작은 신호를 무시하지 마세요. 호미로 막을 것을 가래로 막게 됩니다.",
            expectedEffect: "근육 뭉침 예방 및 피로도 감소"
        },
        en: {
            background: "[Tension Response] Psychological burden converts to muscle tension. Without release, this leads to chronic pain.",
            guideSteps: ["Set hourly alarms to shrug and drop shoulders.", "Consume Vitamin C rich foods.", "Take 5-min stretch breaks."],
            doctorComment: "Don't ignore small signals. Prevention is easier than cure.",
            expectedEffect: "Prevention of stiffness & reduced fatigue"
        }
    },
    "rhomboid": {
        ko: {
            background: "[능형근과 감정] 능형근은 '감정의 근육'입니다. 심리적 위축감이 들 때 어깨가 굽으며 가장 먼저 단축됩니다. 테니스공을 이용한 압박(Ischemic Compression)은 뭉친 근섬유를 효과적으로 이완시킵니다.",
            guideSteps: ["테니스공을 척추와 날개뼈 사이(능형근)에 위치시킵니다.", "체중을 실어 지긋이 누르고 30초간 유지합니다(문지르지 마세요).", "통증이 있는 곳에서 깊게 호흡하세요."],
            doctorComment: "이곳의 통증은 삶의 무게를 짊어진 흔적입니다. 물리적 압박으로 그 짐을 내려놓으세요.",
            expectedEffect: "날개뼈 통증 즉각 완화"
        },
        en: {
            background: "[Rhomboids & Emotion] Rhomboids are 'Emotional Muscles' that shorten with stress. Ischemic Compression with a tennis ball releases these knots.",
            guideSteps: ["Place a tennis ball between spine and scapula.", "Apply pressure for 30s; DO NOT rub.", "Breathe deeply into the pain point."],
            doctorComment: "Pain here tracks the weight of life. Release it physically.",
            expectedEffect: "Immediate scapular pain relief"
        }
    },
    "breathing": {
        ko: {
            background: "[부교감신경 스위치] 4-7-8 호흡법은 강제로 뇌를 진정 모드로 전환하는 생리학적 해킹입니다. 날숨을 길게 뱉으면 미주신경이 자극되어 심박수가 느려집니다.",
            guideSteps: ["코로 4초간 숨을 마십니다.", "7초간 숨을 참습니다.", "입으로 '후-' 소리를 내며 8초간 끝까지 내뱉습니다."],
            doctorComment: "불안해서 숨이 가쁜 게 아니라, 숨이 가빠서 불안한 것입니다. 호흡을 통제하세요.",
            expectedEffect: "즉각적인 심신 안정"
        },
        en: {
            background: "[Parasympathetic Switch] 4-7-8 Breathing is a physiological hack to force-reset the brain. Long exhales stimulate the Vagus Nerve.",
            guideSteps: ["Inhale 4s through nose.", "Hold 7s.", "Exhale 8s through mouth."],
            doctorComment: "Control your breath, and you control your anxiety.",
            expectedEffect: "Immediate mental calm"
        }
    },
    "milk": { 
        ko: {
            background: "[트립토판 효과] 우유에는 수면 유도 호르몬인 멜라토닌의 원료가 되는 '트립토판'이 풍부합니다. 따뜻한 온도는 체온을 약간 높여 졸음을 유도합니다.",
            guideSteps: ["우유 한 컵을 전자레인지에 따뜻하게 데웁니다.", "천천히 씹듯이 마시며 온기를 느낍니다.", "마신 후 바로 양치하고 잠자리에 듭니다."],
            doctorComment: "약에 의존하기 전에, 자연이 주는 수면제를 먼저 시도해보세요.",
            expectedEffect: "심리적 이완 및 수면 유도"
        },
        en: {
            background: "[Tryptophan Effect] Milk is rich in Tryptophan, a precursor to Melatonin. Warmth slightly raises body temp, inducing sleepiness.",
            guideSteps: ["Warm a cup of milk.", "Sip slowly, feeling the warmth.", "Brush teeth and go to bed immediately."],
            doctorComment: "Try nature's sleeping pill before medication.",
            expectedEffect: "Psychological relaxation & sleep induction"
        }
    },
    "window": { 
        ko: {
            background: "[산소 공급] 실내 이산화탄소 농도가 높으면 뇌 기능이 저하되어 '브레인 포그'가 발생합니다. 신선한 산소는 뇌를 깨우는 가장 빠른 연료입니다.",
            guideSteps: ["창문을 활짝 열어 맞바람을 일으킵니다.", "창가에 서서 깊게 심호흡을 3번 합니다.", "1분 동안 바깥 공기를 피부로 느낍니다."],
            doctorComment: "머리가 멍할 땐 커피보다 환기가 더 효과적입니다.",
            expectedEffect: "집중력 회복 및 두통 완화"
        },
        en: {
            background: "[Oxygen Supply] High indoor CO2 causes Brain Fog. Fresh oxygen is the fastest fuel to wake up your brain.",
            guideSteps: ["Open windows wide.", "Take 3 deep breaths by the window.", "Feel the fresh air for 1 min."],
            doctorComment: "Fresh air beats coffee for clearing brain fog.",
            expectedEffect: "Restored focus & headache relief"
        }
    },
    "stretch": { 
        ko: {
            background: "[근방추 재설정] 스트레칭은 짧아진 근육을 늘려 뇌에 '안전하다'는 신호를 보냅니다. 혈류량을 늘려 피로 물질을 씻어냅니다.",
            guideSteps: ["팔을 하늘 높이 뻗으며 온몸을 늘립니다.", "어깨를 귀까지 으쓱였다가 툭 떨어뜨립니다.", "목을 천천히 좌우로 돌려줍니다."],
            doctorComment: "몸이 굳으면 생각도 굳습니다. 몸을 유연하게 하세요.",
            expectedEffect: "혈액 순환 개선 및 활력"
        },
        en: {
            background: "[Muscle Spindle Reset] Stretching signals 'safety' to the brain and flushes out fatigue toxins by increasing blood flow.",
            guideSteps: ["Reach arms high and stretch.", "Shrug shoulders to ears and drop.", "Rotate neck slowly."],
            doctorComment: "Stiff body, stiff mind. Stay flexible.",
            expectedEffect: "Better circulation & vitality"
        }
    },
    "worry_log": { 
        ko: {
            background: "[외현화 기법] 머릿속 걱정을 글로 적으면 뇌는 이를 '처리된 정보'로 인식하여 반복 재생(반추)을 멈춥니다. 작업 기억 용량을 확보하는 과정입니다.",
            guideSteps: ["잠들기 전 노트에 걱정거리를 모두 적습니다.", "해결책을 적으려 하지 말고 배설하듯 적으세요.", "노트를 덮으며 '오늘 고민 끝'이라고 말하세요."],
            doctorComment: "종이는 당신의 가장 훌륭한 청자입니다.",
            expectedEffect: "입면 불안 감소"
        },
        en: {
            background: "[Externalization] Writing worries marks them as 'Processed Info', stopping the brain's loop. It frees up working memory.",
            guideSteps: ["Write down all worries before bed.", "Don't solve, just vent.", "Close the notebook saying 'Done for today'."],
            doctorComment: "Paper is your best listener.",
            expectedEffect: "Reduced sleep anxiety"
        }
    },
    "heat": {
        ko: {
            background: "[혈관 확장] 온찜질은 수축된 혈관을 열어 산소와 영양분을 공급합니다. 통증 유발 물질을 씻어내는 가장 빠른 방법입니다.",
            guideSteps: ["핫팩이나 따뜻한 수건을 준비합니다.", "통증 부위에 15분간 올려둡니다.", "따뜻함이 퍼지는 느낌에 집중하세요."],
            doctorComment: "마음의 긴장까지 녹여주는 따뜻한 처방입니다.",
            expectedEffect: "근육통 완화 및 이완"
        },
        en: {
            background: "[Vasodilation] Heat opens constricted vessels, flushing out pain toxins. It's the fastest way to relax muscles.",
            guideSteps: ["Prepare a hot pack.", "Apply to pain area for 15 mins.", "Focus on the spreading warmth."],
            doctorComment: "A warm prescription that melts mental tension too.",
            expectedEffect: "Muscle pain relief & relaxation"
        }
    },
    "water": {
        ko: {
            background: "[교감신경 진정] 물을 마시는 행위는 삼킴 반사를 통해 부교감 신경을 자극합니다. 또한 탈수로 인한 스트레스 호르몬 증가를 막아줍니다.",
            guideSteps: ["미지근한 물 한 컵을 준비합니다.", "천천히 음미하며 마십니다.", "식도를 넘어가는 느낌에 집중하세요."],
            doctorComment: "물은 가장 저렴하고 효과적인 진정제입니다.",
            expectedEffect: "심박수 안정 및 수분 보충"
        },
        en: {
            background: "[Calming Sympathetic NS] Swallowing water stimulates the parasympathetic system. Hydration prevents stress hormone spikes.",
            guideSteps: ["Get a cup of lukewarm water.", "Sip slowly.", "Focus on the sensation."],
            doctorComment: "Water is the cheapest sedative.",
            expectedEffect: "Heart rate stability & hydration"
        }
    },
    "detox": {
        ko: {
            background: "[도파민 디톡스] 스마트폰의 빛과 정보는 뇌를 쉬지 못하게 합니다. 잠시 연결을 끊는 것은 과열된 뇌를 식히는 쿨링 타임입니다.",
            guideSteps: ["스마트폰을 보이지 않는 곳에 둡니다.", "방해금지 모드를 켭니다.", "심심함을 온전히 느껴봅니다."],
            doctorComment: "심심함은 뇌가 회복하고 있다는 증거입니다.",
            expectedEffect: "정신적 명료함 회복"
        },
        en: {
            background: "[Dopamine Detox] Digital stimuli prevent brain rest. Disconnecting is cooling time for your overheated brain.",
            guideSteps: ["Hide your phone.", "Turn on DND mode.", "Embrace the boredom."],
            doctorComment: "Boredom is proof your brain is healing.",
            expectedEffect: "Restored mental clarity"
        }
    },
    "walk": {
        ko: {
            background: "[세로토닌 샤워] 햇볕을 쬐며 걷는 것은 천연 항우울제인 세로토닌 합성을 촉진합니다. 리듬감 있는 움직임은 뇌파를 안정시킵니다.",
            guideSteps: ["가벼운 신발을 신고 밖으로 나갑니다.", "햇살을 느끼며 20분간 걷습니다.", "발바닥의 감각에 집중하세요."],
            doctorComment: "우울감은 정적인 상태에서 자라납니다. 몸을 움직이세요.",
            expectedEffect: "기분 전환 및 활력"
        },
        en: {
            background: "[Serotonin Shower] Walking in sunlight boosts Serotonin, a natural antidepressant. Rhythmic movement stabilizes brain waves.",
            guideSteps: ["Go outside.", "Walk for 20 mins in the sun.", "Focus on your feet."],
            doctorComment: "Depression grows in stillness. Move your body.",
            expectedEffect: "Mood lift & vitality"
        }
    },

    // --- 🔥 NEW ITEMS FOR FILLER DAYS ---
    "gut": {
        ko: {
            background: "[장-뇌 축 (Gut-Brain Axis)] 장은 '제2의 뇌'입니다. 스트레스로 미주신경 기능이 저하되면 위장 운동이 멈추고 소화불량이 발생합니다. 뇌의 불안이 장으로 전달된 결과입니다.",
            guideSteps: ["배꼽 주변을 시계 방향으로 부드럽게 문지릅니다.", "따뜻한 물을 천천히 마십니다.", "복식 호흡으로 횡격막을 움직여 내장을 마사지합니다."],
            doctorComment: "속이 편해야 마음이 편합니다. 장을 위로해주세요.",
            expectedEffect: "소화 촉진 및 불안 감소"
        },
        en: {
            background: "[Gut-Brain Axis] The gut is the 'Second Brain'. Stress inhibits the Vagus Nerve, stopping digestion. Anxiety translates directly to gut pain.",
            guideSteps: ["Massage belly button clockwise.", "Drink warm water slowly.", "Use diaphragmatic breathing to massage organs."],
            doctorComment: "Calm gut, calm mind. Soothe your stomach.",
            expectedEffect: "Better digestion & reduced anxiety"
        }
    },
    "eye": {
        ko: {
            background: "[디지털 눈 피로 (DES)] 눈의 모양체 근육 긴장은 후두하근(목 뒤) 경직으로 이어져 두통을 유발합니다. 시각 정보 처리는 뇌 에너지의 40%를 소모합니다.",
            guideSteps: ["20분마다 20초간 먼 곳(6m)을 바라봅니다.", "손바닥을 비벼 눈 위에 얹는 '파밍'을 합니다.", "눈을 감고 시계 방향으로 천천히 굴립니다."],
            doctorComment: "눈을 감는 것만으로도 뇌는 휴식 모드로 전환됩니다.",
            expectedEffect: "두통 완화 및 집중력 회복"
        },
        en: {
            background: "[Digital Eye Strain] Ciliary muscle tension leads to neck stiffness and headaches. Visual processing consumes 40% of brain energy.",
            guideSteps: ["Look at 20ft away for 20s every 20 mins.", "Palm your eyes with warm hands.", "Roll eyes slowly clockwise."],
            doctorComment: "Closing your eyes instantly switches the brain to rest mode.",
            expectedEffect: "Headache relief & focus reset"
        }
    },
    "tmj": {
        ko: {
            background: "[턱관절과 스트레스] 우리는 스트레스를 받을 때 무의식적으로 이를 악뭅니다. 턱 근육(교근)의 긴장은 뇌혈류를 방해하고 편두통을 유발합니다.",
            guideSteps: ["입을 가볍게 벌리고 '아-' 소리를 냅니다.", "턱 관절 부위를 손가락으로 원을 그리며 마사지합니다.", "혀끝을 입천장에 대고 턱에 힘을 뺍니다."],
            doctorComment: "이와 이 사이를 2mm만 띄워도 뇌는 이완됩니다.",
            expectedEffect: "편두통 예방 및 얼굴 긴장 완화"
        },
        en: {
            background: "[TMJ & Stress] We clench jaws unconsciously under stress. Masseter tension blocks blood flow to the brain, causing migraines.",
            guideSteps: ["Open mouth slightly and say 'Ah'.", "Massage jaw joints in circles.", "Rest tongue on the roof of the mouth."],
            doctorComment: "A 2mm gap between teeth signals relaxation to the brain.",
            expectedEffect: "Migraine prevention & facial relaxation"
        }
    },
    "sugar": {
        ko: {
            background: "[혈당 스파이크와 감정] 정제 당분(설탕, 밀가루) 섭취 후 급격한 혈당 저하는 코르티솔 분비를 유발해 짜증과 불안을 증폭시킵니다.",
            guideSteps: ["식사 후 바로 앉지 말고 10분간 걷습니다.", "간식이 당길 때 물 한 잔을 먼저 마십니다.", "단백질 위주의 식사를 합니다."],
            doctorComment: "기분이 오락가락한다면, 성격 탓이 아니라 혈당 탓일 수 있습니다.",
            expectedEffect: "감정 기복 안정"
        },
        en: {
            background: "[Sugar Spike & Mood] Blood sugar crashes after refined sugar intake trigger cortisol, amplifying irritability and anxiety.",
            guideSteps: ["Walk 10 mins after meals.", "Drink water when craving snacks.", "Prioritize protein."],
            doctorComment: "Mood swings might be blood sugar swings, not personality flaws.",
            expectedEffect: "Stable emotions"
        }
    },
    "social": {
        ko: {
            background: "[사회적 연결감] 고립감은 뇌에게 '생존 위협'으로 인식됩니다. 가벼운 사회적 상호작용은 옥시토신을 분비시켜 스트레스를 낮춥니다.",
            guideSteps: ["가까운 친구에게 짧은 안부 문자를 보냅니다.", "카페 점원에게 눈을 맞추며 인사합니다.", "반려동물이나 식물과 교감합니다."],
            doctorComment: "거창한 대화가 아니어도 좋습니다. 연결되어 있다는 느낌이면 충분합니다.",
            expectedEffect: "고립감 해소 및 안정감"
        },
        en: {
            background: "[Social Connection] Isolation is perceived as a 'Survival Threat'. Light interaction boosts Oxytocin, lowering stress.",
            guideSteps: ["Text a close friend.", "Greet a barista with eye contact.", "Interact with a pet or plant."],
            doctorComment: "You don't need deep talks. Feeling connected is enough.",
            expectedEffect: "Reduced isolation & safety"
        }
    },
    "posture": {
        ko: {
            background: "[상부 교차 증후군] 구부정한 자세는 폐활량을 줄이고 뇌로 가는 산소 공급을 방해합니다. 가슴을 펴는 동작만으로도 자신감 호르몬인 테스토스테론이 미세하게 증가합니다.",
            guideSteps: ["문틀 양옆을 잡고 가슴을 앞으로 내밉니다.", "견갑골을 뒤로 모아 아래로 끌어내립니다.", "정수리가 천장에 닿는 느낌으로 척추를 세웁니다."],
            doctorComment: "자세가 마음을 만듭니다. 어깨를 펴면 기분도 펴집니다.",
            expectedEffect: "활력 증진 및 척추 건강"
        },
        en: {
            background: "[Upper Crossed Syndrome] Slouching reduces lung capacity and oxygen to the brain. Opening the chest slightly boosts testosterone, the confidence hormone.",
            guideSteps: ["Hold a doorway and lean forward.", "Squeeze shoulder blades down and back.", "Lengthen your spine upwards."],
            doctorComment: "Posture shapes the mind. Stand tall to feel strong.",
            expectedEffect: "Increased vitality & spinal health"
        }
    },
    "noise": {
        ko: {
            background: "[청각 과부하] 현대인은 끊임없는 소음 공해에 노출되어 있습니다. 이는 코르티솔 수치를 높입니다. 의도적인 침묵은 뇌의 '디폴트 모드 네트워크'를 활성화하여 창의성을 높입니다.",
            guideSteps: ["노이즈 캔슬링 헤드폰을 착용하거나 조용한 방으로 이동합니다.", "5분간 아무 소리도 듣지 않는 시간을 갖습니다.", "빗소리 같은 백색 소음을 활용합니다."],
            doctorComment: "귀를 쉬게 해야 뇌가 쉽니다.",
            expectedEffect: "신경 과민 완화"
        },
        en: {
            background: "[Auditory Overload] Constant noise pollution spikes cortisol. Intentional silence activates the brain's 'Default Mode Network', boosting creativity.",
            guideSteps: ["Use noise-canceling headphones or find a quiet room.", "Spend 5 mins in total silence.", "Use white noise like rain sounds."],
            doctorComment: "Rest your ears to rest your brain.",
            expectedEffect: "Reduced sensory overload"
        }
    },
    "sun": {
        ko: {
            background: "[비타민 D와 무기력] 햇빛 부족은 세로토닌 합성을 방해하여 계절성 우울증(SAD)과 유사한 무기력을 유발합니다. 눈으로 들어오는 밝은 빛은 생체 시계를 재설정합니다.",
            guideSteps: ["점심 시간에 10분간 밖으로 나갑니다.", "창가에서 밝은 하늘을 바라봅니다.", "실내 조명을 최대한 밝게 켭니다."],
            doctorComment: "햇빛은 공짜 영양제입니다. 놓치지 마세요.",
            expectedEffect: "수면 패턴 정상화 및 기분 전환"
        },
        en: {
            background: "[Vitamin D & Lethargy] Lack of sun blocks Serotonin synthesis, causing lethargy like SAD. Bright light resets your circadian clock.",
            guideSteps: ["Go out for 10 mins at lunch.", "Gaze at the bright sky from a window.", "Maximize indoor lighting."],
            doctorComment: "Sunlight is a free supplement. Don't miss it.",
            expectedEffect: "Better sleep & mood lift"
        }
    }
};

// 🔥 SMART MATCHER (UPDATED)
const getMockRichDetail = (keyword: string, lang: Language): RichDetail => {
    const isKo = lang === 'ko';
    const key = keyword.toLowerCase();
    
    let matchKey = 'cortisol'; // Default fallback

    // Map keywords to DB keys
    if (key.includes('gut') || key.includes('stomach') || key.includes('소화') || key.includes('배')) matchKey = 'gut';
    else if (key.includes('eye') || key.includes('vision') || key.includes('눈') || key.includes('시력')) matchKey = 'eye';
    else if (key.includes('jaw') || key.includes('tmj') || key.includes('턱') || key.includes('이갈이')) matchKey = 'tmj';
    else if (key.includes('sugar') || key.includes('diet') || key.includes('혈당') || key.includes('식사') || key.includes('간식') || key.includes('snack')) matchKey = 'sugar';
    else if (key.includes('social') || key.includes('friend') || key.includes('친구') || key.includes('관계') || key.includes('text') || key.includes('문자')) matchKey = 'social';
    else if (key.includes('posture') || key.includes('spine') || key.includes('자세') || key.includes('척추') || key.includes('stand') || key.includes('chest')) matchKey = 'posture';
    else if (key.includes('noise') || key.includes('sound') || key.includes('소음') || key.includes('quiet') || key.includes('조용')) matchKey = 'noise';
    else if (key.includes('sun') || key.includes('light') || key.includes('햇빛') || key.includes('curtain') || key.includes('커튼')) matchKey = 'sun';
    
    // Existing mappings
    else if (key.includes('cortisol') || key.includes('코르티솔')) matchKey = 'cortisol';
    else if (key.includes('adrenaline') || key.includes('아드레날린')) matchKey = 'adrenaline';
    else if (key.includes('dopamine') || key.includes('도파민')) matchKey = 'dopamine';
    else if (key.includes('early stress') || key.includes('초기 스트레스')) matchKey = 'early_stress';
    else if (key.includes('rhomboid') || key.includes('능형근') || key.includes('tennis') || key.includes('테니스')) matchKey = 'rhomboid';
    else if (key.includes('breath') || key.includes('호흡')) matchKey = 'breathing';
    else if (key.includes('milk') || key.includes('우유')) matchKey = 'milk';
    else if (key.includes('window') || key.includes('window') || key.includes('환기')) matchKey = 'window';
    else if (key.includes('stretch') || key.includes('스트레칭') || key.includes('roll') || key.includes('기지개')) matchKey = 'stretch';
    else if (key.includes('worry') || key.includes('걱정') || key.includes('write') || key.includes('기록')) matchKey = 'worry_log';
    else if (key.includes('heat') || key.includes('찜질') || key.includes('hot') || key.includes('pack')) matchKey = 'heat';
    else if (key.includes('water') || key.includes('물')) matchKey = 'water';
    else if (key.includes('phone') || key.includes('detox') || key.includes('스마트폰')) matchKey = 'detox';
    else if (key.includes('walk') || key.includes('산책')) matchKey = 'walk';

    const dbItem = RICH_DETAILS_DB[matchKey] || RICH_DETAILS_DB['cortisol'];
    return isKo ? dbItem.ko : dbItem.en;
};


// --------------------------------------------------------------------------
// 📖 THE NARRATIVE ARC (FIXED SCENARIOS - DO NOT TOUCH)
// --------------------------------------------------------------------------
interface Dialogue { user: string; ai: string; }
interface DailyScenario {
    offset: number;
    score: number;
    summary: string;
    dialogues: Dialogue[];
    medical: MedicalAnalysisData;
    guides: CustomGuideItem[];
    actions: MicroAction[];
    tags: { health: string[], career: string[] };
}

const SCENARIOS_KO: DailyScenario[] = [
    {
        offset: 0, // 오늘
        score: 1,
        summary: "극심한 견갑골 통증과 무기력감 호소. 스트레스 지수 최고조(9/10). 즉각적인 이완 필요.",
        dialogues: [
            {
                user: "왼쪽 견갑골 안쪽이 찢어지는 듯이 아프고, 자고 일어나도 맞은 것처럼 온몸이 무거워요.",
                ai: `---
### 🔍 1. Health Insight (건강 분석)
* **Mechanism**: **근막통증증후군(MPS)** 급성 악화 및 **섬유근육통** 유사 패턴입니다.
* **Connection**: 극심한 스트레스(9/10)가 근육을 **'투쟁-도피(Fight or Flight)'** 상태로 고정시켜, 능형근과 승모근이 돌처럼 굳어 혈류를 차단하고 있습니다.

### 💊 2. Nutrition & Care Guide (영양 및 관리 가이드)
* **Care**: 지금은 운동보다는 **'적극적 휴식'**이 필요합니다. 온찜질로 강제로 혈류를 공급해야 합니다.

### 🧘 3. Recovery Action Guide (회복 행동 가이드)
* **Physical**: **테니스공 릴리즈** - 날개뼈 안쪽 통증 유발점을 30초간 지그시 눌러주세요.
---`
            },
            {
                user: "미래가 보이지 않아 숨이 턱 막히는 불안감이 들고, 아무것도 할 수 없을 것 같은 무기력함이 너무 심해요.",
                ai: `---
### 🔍 1. Health Insight (건강 분석)
* **Mechanism**: **학습된 무기력(Learned Helplessness)**과 **편도체 납치(Amygdala Hijack)** 상태입니다.

### 🧘 3. Recovery Action Guide (회복 행동 가이드)
* **Physical**: **4-7-8 호흡** - 4초 마시고, 7초 멈추고, 8초 내뱉으며 부교감 신경을 강제로 켭니다.
---`
            }
        ],
        medical: {
            hormone: "코르티솔 폭주 (Cortisol Spike)",
            hormoneDesc: "스트레스 호르몬 과다로 인한 전신 염증 및 근육 경직 상태.",
            suggestion: "판단 중지 및 감각 몰입 (Grounding).",
            nutrient: "마그네슘 & 테아닌"
        },
        guides: [
            { type: 'physical', icon: '🎾', title: '능형근 테니스공 이완', exercise: '테니스공 압박', tip: '30초간 호흡 유지' },
            { type: 'mental', icon: '🌬️', title: '4-7-8 호흡 재설정', exercise: '4-7-8 호흡법', tip: '내뱉을 때 이완됨' }
        ],
        actions: [
            { id: 'a0-1', title: '온찜질 15분', description: '등 근육 혈류 공급', category: 'health', difficulty: 'easy', completed: false, estimated_time: '15분' },
            { id: 'a0-2', title: '물 한 잔 마시기', description: '교감신경 진정', category: 'routine', difficulty: 'easy', completed: false, estimated_time: '1분' },
            { id: 'a0-3', title: '스마트폰 1시간 끄기', description: '도파민 디톡스', category: 'mental', difficulty: 'medium', completed: false, estimated_time: '1시간' }
        ],
        tags: { health: ["능형근통증", "만성피로"], career: ["무기력"] }
    },
    {
        offset: 1, // 어제
        score: 2,
        summary: "수면 장애 및 불안감 고조. 신체화 증상 시작.",
        dialogues: [{ user: "잠을 자려고 누웠는데 심장이 너무 빨리 뛰어서 한숨도 못 잤어요.", ai: "### 🔍 1. Health Insight\n* **Mechanism**: **자율신경 실조** 초기 증상입니다. 입면 불안이 신체 긴장으로 이어지고 있습니다..." }],
        medical: { hormone: "아드레날린 과다 (Adrenaline)", hormoneDesc: "야간 각성 상태. 수면 위생 점검 및 카모마일 티 섭취 권장.", suggestion: "수면 위생 점검.", nutrient: "캐모마일 티" },
        guides: [{ type: 'mental', icon: '📝', title: '걱정 기록하기', exercise: '자기 전 걱정 노트 쓰기', tip: '뇌에서 비워내기' }],
        actions: [{ id: 'a1-1', title: '따뜻한 우유 마시기', description: '트립토판 섭취', category: 'health', difficulty: 'easy', completed: true, estimated_time: '5분' }],
        tags: { health: ["불면증", "심계항진"], career: [] }
    },
    {
        offset: 3, // 3일 전
        score: 3,
        summary: "만성적인 피로감. 의욕 저하.",
        dialogues: [{ user: "컴퓨터 앞에만 앉으면 머리가 하얗게 되고 멍해집니다.", ai: "### 🔍 1. Health Insight\n* **Mechanism**: **브레인 포그(Brain Fog)** 현상입니다..." }],
        medical: { hormone: "도파민 저하 (Low Dopamine)", hormoneDesc: "동기 부여 회로 약화.", suggestion: "짧은 산책.", nutrient: "오메가-3" },
        guides: [{ type: 'physical', icon: '🚶', title: '햇볕 쬐며 산책', exercise: '점심시간 산책', tip: '세로토닌 합성' }],
        actions: [{ id: 'a3-1', title: '창문 열고 환기', description: '산소 공급', category: 'routine', difficulty: 'easy', completed: true, estimated_time: '1분' }],
        tags: { health: ["브레인포그"], career: ["집중력저하"] }
    },
    {
        offset: 7, // 7일 전
        score: 4,
        summary: "간헐적인 등 통증 시작. 스트레스 누적.",
        dialogues: [{ user: "요즘 일이 안 구해져서 그런지 등이 자꾸 결리네요.", ai: "### 🔍 1. Health Insight\n* **Mechanism**: 심리적 부담이 **승모근 긴장**으로 나타나고 있습니다..." }],
        medical: { hormone: "초기 스트레스 반응", hormoneDesc: "근육 긴장 시작.", suggestion: "스트레칭 생활화.", nutrient: "비타민 C" },
        guides: [{ type: 'physical', icon: '🙆', title: '어깨 스트레칭', exercise: '수시로 어깨 으쓱하기', tip: '긴장 풀기' }],
        actions: [{ id: 'a7-1', title: '기지개 켜기', description: '근육 이완', category: 'health', difficulty: 'easy', completed: true, estimated_time: '10초' }],
        tags: { health: ["어깨결림"], career: ["구직스트레스"] }
    }
];

const SCENARIOS_EN: DailyScenario[] = [
    {
        offset: 0,
        score: 1,
        summary: "Severe scapular pain & helplessness. Stress level peak (9/10). Immediate relaxation needed.",
        dialogues: [
            {
                user: "Severe stabbing pain in the inner left scapula. Waking up feels like being beaten all over.",
                ai: `---
### 🔍 1. Health Insight
* **Mechanism**: Acute **Myofascial Pain Syndrome (MPS)** and **Hyperarousal**.

### 💊 2. Nutrition & Care Guide
* **Care**: You need **'Active Rest'** now. Use heat to force blood flow.

### 🧘 3. Recovery Action Guide
* **Physical**: **Tennis Ball Release** - Press the trigger point inside the shoulder blade for 30s.
---`
            },
            {
                user: "Suffocating anxiety about the future. Learned helplessness making me feel I can't do anything.",
                ai: `---
### 🔍 1. Health Insight
* **Mechanism**: **Learned Helplessness** and **Amygdala Hijack**.

### 🧘 3. Recovery Action Guide
* **Physical**: **4-7-8 Breathing** - Inhale 4s, Hold 7s, Exhale 8s.
---`
            }
        ],
        medical: {
            hormone: "Cortisol Spike",
            hormoneDesc: "Systemic inflammation & muscle rigidity due to stress hormones.",
            suggestion: "Stop judging & Grounding.",
            nutrient: "Magnesium & Theanine"
        },
        guides: [
            { type: 'physical', icon: '🎾', title: 'Rhomboid Release', exercise: 'Tennis ball pressure', tip: 'Breathe for 30s' },
            { type: 'mental', icon: '🌬️', title: '4-7-8 Breathing', exercise: 'Reset Breath', tip: 'Relax on exhale' }
        ],
        actions: [
            { id: 'a0-1', title: 'Hot Pack 15m', description: 'Blood flow to back', category: 'health', difficulty: 'easy', completed: false, estimated_time: '15min' },
            { id: 'a0-2', title: 'Drink Water', description: 'Calm sympathetic NS', category: 'routine', difficulty: 'easy', completed: false, estimated_time: '1min' },
            { id: 'a0-3', title: 'Phone Off 1h', description: 'Dopamine Detox', category: 'mental', difficulty: 'medium', completed: false, estimated_time: '1hr' }
        ],
        tags: { health: ["Rhomboid Pain", "Chronic Fatigue"], career: ["Helplessness"] }
    },
    {
        offset: 1,
        score: 2,
        summary: "Sleep disturbance & High anxiety. Somatization begins.",
        dialogues: [{ user: "I couldn't sleep at all because my heart was racing.", ai: "### 🔍 1. Health Insight\n* **Mechanism**: Early **Dysautonomia**..." }],
        medical: { hormone: "Adrenaline Surge", hormoneDesc: "Nocturnal arousal. Recommend sleep hygiene & chamomile.", suggestion: "Check sleep hygiene.", nutrient: "Chamomile Tea" },
        guides: [{ type: 'mental', icon: '📝', title: 'Worry Log', exercise: 'Write worries before bed', tip: 'Empty the brain' }],
        actions: [{ id: 'a1-1', title: 'Warm Milk', description: 'Tryptophan', category: 'health', difficulty: 'easy', completed: true, estimated_time: '5min' }],
        tags: { health: ["Insomnia", "Palpitation"], career: [] }
    },
    {
        offset: 3,
        score: 3,
        summary: "Chronic fatigue. Low motivation.",
        dialogues: [{ user: "My mind goes blank whenever I sit at the computer.", ai: "### 🔍 1. Health Insight\n* **Mechanism**: **Brain Fog** phenomenon..." }],
        medical: { hormone: "Low Dopamine", hormoneDesc: "Weak motivation circuit.", suggestion: "Short walk.", nutrient: "Omega-3" },
        guides: [{ type: 'physical', icon: '🚶', title: 'Sunlight Walk', exercise: 'Lunch walk', tip: 'Serotonin boost' }],
        actions: [{ id: 'a3-1', title: 'Open Window', description: 'Oxygen supply', category: 'routine', difficulty: 'easy', completed: true, estimated_time: '1min' }],
        tags: { health: ["Brain Fog"], career: ["Low Focus"] }
    },
    {
        offset: 7,
        score: 4,
        summary: "Intermittent back pain. Stress accumulation.",
        dialogues: [{ user: "My back keeps knotting up, maybe due to job hunting.", ai: "### 🔍 1. Health Insight\n* **Mechanism**: Psychological burden is manifesting as **Trapezius tension**..." }],
        medical: { hormone: "Early Stress Response", hormoneDesc: "Muscle tension begins.", suggestion: "Stretch often.", nutrient: "Vitamin C" },
        guides: [{ type: 'physical', icon: '🙆', title: 'Shoulder Roll', exercise: 'Shrug shoulders often', tip: 'Release tension' }],
        actions: [{ id: 'a7-1', title: 'Stretching', description: 'Muscle release', category: 'health', difficulty: 'easy', completed: true, estimated_time: '10s' }],
        tags: { health: ["Stiff Shoulders"], career: ["Job Stress"] }
    }
];

// --------------------------------------------------------------------------
// 🎭 PROCEDURAL TEMPLATES FOR FILLER DAYS
// --------------------------------------------------------------------------
const TEMPLATES_KO = [
    // 0: Gut Issue
    {
        summary: "소화 불량 및 복부 팽만감 호소.",
        user: "속이 계속 더부룩하고 체한 것 같아요.",
        hormone: "미주신경 저하", hormoneDesc: "장-뇌 축 불균형으로 인한 위장 장애.", nutrient: "유산균", suggestion: "복부 마사지.",
        guideTitle: "장 마사지", guideEx: "배꼽 주변 문지르기", guideIcon: "🌀",
        actionTitle: "따뜻한 물 마시기", actionCat: "health"
    },
    // 1: Eye Strain
    {
        summary: "디지털 눈 피로 및 두통.",
        user: "모니터를 너무 봐서 눈이 빠질 것 같아요.",
        hormone: "시각 피로", hormoneDesc: "후두하근 긴장 및 뇌 피로.", nutrient: "루테인", suggestion: "눈 휴식.",
        guideTitle: "눈 굴리기", guideEx: "눈 감고 시계방향 회전", guideIcon: "👀",
        actionTitle: "눈 온찜질", actionCat: "health"
    },
    // 2: Social Withdrawal
    {
        summary: "대인기피 및 고립감.",
        user: "사람들 연락도 받기 싫고 혼자 있고 싶어요.",
        hormone: "옥시토신 부족", hormoneDesc: "사회적 연결 단절로 인한 스트레스.", nutrient: "다크초콜릿", suggestion: "작은 연결.",
        guideTitle: "안부 문자 보내기", guideEx: "친구에게 짧은 인사", guideIcon: "📱",
        actionTitle: "반려식물 물주기", actionCat: "mental"
    },
    // 3: TMJ/Jaw
    {
        summary: "턱관절 통증 및 이갈이 의심.",
        user: "자고 일어나니 턱이 뻐근해요.",
        hormone: "교근 긴장", hormoneDesc: "무의식적 이악물기 반응.", nutrient: "칼슘", suggestion: "턱 힘 빼기.",
        guideTitle: "턱 이완", guideEx: "입 벌리고 '아' 소리내기", guideIcon: "😮",
        actionTitle: "입꼬리 올리기", actionCat: "physical"
    },
    // 4: Sugar Crash
    {
        summary: "오후 무기력증 및 당기운 저하.",
        user: "오후만 되면 급격히 피곤하고 짜증이 나요.",
        hormone: "혈당 스파이크", hormoneDesc: "인슐린 반응성 저하.", nutrient: "복합탄수화물", suggestion: "간식 조절.",
        guideTitle: "단백질 간식", guideEx: "견과류 섭취", guideIcon: "🥜",
        actionTitle: "물 한 잔 마시기", actionCat: "health"
    },
    // 5: Posture
    {
        summary: "구부정한 자세 및 허리 통증.",
        user: "하루 종일 구부정하게 앉아 있었어요.",
        hormone: "척추 피로", hormoneDesc: "상부 교차 증후군 의심.", nutrient: "단백질", suggestion: "자세 교정.",
        guideTitle: "가슴 펴기", guideEx: "문틀 잡고 늘리기", guideIcon: "🚪",
        actionTitle: "일어서서 스트레칭", actionCat: "physical"
    },
    // 6: Noise Sensitivity
    {
        summary: "청각 예민 및 소음 스트레스.",
        user: "작은 소리에도 예민해지고 화가 나요.",
        hormone: "감각 과부하", hormoneDesc: "신경계 과민 반응.", nutrient: "마그네슘", suggestion: "청각 휴식.",
        guideTitle: "백색 소음", guideEx: "빗소리 듣기", guideIcon: "🎧",
        actionTitle: "조용한 곳에서 5분", actionCat: "mental"
    },
    // 7: Lack of Sun
    {
        summary: "햇빛 부족 및 우울감.",
        user: "하루 종일 집에만 있었더니 쳐지네요.",
        hormone: "비타민D 부족", hormoneDesc: "생체 리듬 불균형.", nutrient: "비타민D", suggestion: "일광욕.",
        guideTitle: "햇볕 쬐기", guideEx: "점심 산책 10분", guideIcon: "☀️",
        actionTitle: "커튼 활짝 열기", actionCat: "routine"
    }
];

const TEMPLATES_EN = [
    {
        summary: "Indigestion & Bloating.",
        user: "Stomach feels knotted and bloated.",
        hormone: "Vagus Inhibition", hormoneDesc: "Gut-Brain imbalance.", nutrient: "Probiotics", suggestion: "Belly Massage.",
        guideTitle: "Gut Massage", guideEx: "Rub belly clockwise", guideIcon: "🌀",
        actionTitle: "Drink Warm Water", actionCat: "health"
    },
    {
        summary: "Digital Eye Strain & Headache.",
        user: "Eyes hurt from too much screen time.",
        hormone: "Visual Fatigue", hormoneDesc: "Suboccipital tension.", nutrient: "Lutein", suggestion: "Eye Rest.",
        guideTitle: "Eye Rolling", guideEx: "Rotate eyes slowly", guideIcon: "👀",
        actionTitle: "Warm Eye Mask", actionCat: "health"
    },
    {
        summary: "Social Withdrawal.",
        user: "I don't want to talk to anyone.",
        hormone: "Low Oxytocin", hormoneDesc: "Social disconnection.", nutrient: "Dark Chocolate", suggestion: "Small Connection.",
        guideTitle: "Send Text", guideEx: "Say hi to a friend", guideIcon: "📱",
        actionTitle: "Water a Plant", actionCat: "mental"
    },
    {
        summary: "Jaw Pain & Clenching.",
        user: "Woke up with a sore jaw.",
        hormone: "Masseter Tension", hormoneDesc: "Stress clenching.", nutrient: "Calcium", suggestion: "Relax Jaw.",
        guideTitle: "Jaw Release", guideEx: "Say 'Ah' loosely", guideIcon: "😮",
        actionTitle: "Smile Stretch", actionCat: "physical"
    },
    {
        summary: "Afternoon Crash.",
        user: "Critically tired in the afternoon.",
        hormone: "Sugar Crash", hormoneDesc: "Insulin spike.", nutrient: "Complex Carbs", suggestion: "Snack Smart.",
        guideTitle: "Protein Snack", guideEx: "Eat nuts", guideIcon: "🥜",
        actionTitle: "Drink Water", actionCat: "health"
    },
    {
        summary: "Poor Posture Back Pain.",
        user: "Slouched all day, back hurts.",
        hormone: "Spinal Fatigue", hormoneDesc: "Upper crossed syndrome.", nutrient: "Protein", suggestion: "Correct Posture.",
        guideTitle: "Open Chest", guideEx: "Doorway stretch", guideIcon: "🚪",
        actionTitle: "Stand Up", actionCat: "physical"
    },
    {
        summary: "Noise Sensitivity.",
        user: "Small sounds irritate me.",
        hormone: "Sensory Overload", hormoneDesc: "Nervous system alert.", nutrient: "Magnesium", suggestion: "Auditory Rest.",
        guideTitle: "White Noise", guideEx: "Listen to rain", guideIcon: "🎧",
        actionTitle: "Quiet Time 5m", actionCat: "mental"
    },
    {
        summary: "Lack of Sunlight Blues.",
        user: "Stayed inside all day, feeling down.",
        hormone: "Low Vitamin D", hormoneDesc: "Circadian mismatch.", nutrient: "Vitamin D", suggestion: "Sunlight.",
        guideTitle: "Sunlight Walk", guideEx: "10 min walk", guideIcon: "☀️",
        actionTitle: "Open Curtains", actionCat: "routine"
    }
];

// --- 🔥 CENTRALIZED DEMO DATA GENERATOR ---
export const getDemoScenario = (offset: number, language: Language): {
    summary: DailySummary;
    logs: MemoryLog[];
    checklist: DailyChecklist;
} | null => {
    const isKo = language === 'ko';
    
    // 1. Check if an explicit scenario exists for this offset (Day 0, 1, 3, 7)
    // 🔥 CRITICAL: PRESERVE ORIGINAL DEMO SCENARIOS
    const scenarios = isKo ? SCENARIOS_KO : SCENARIOS_EN;
    let scenario = scenarios.find(s => s.offset === offset);
    
    // 2. Procedural Generation for Filler Days
    // Replaces the old "Rest/Recovery" filler with diverse templates
    if (!scenario) {
        const templates = isKo ? TEMPLATES_KO : TEMPLATES_EN;
        const index = offset % templates.length;
        const template = templates[index];

        const dateStr = getRelativeDate(offset);
        
        // Calculate Score Wave
        let score = 3 + (offset % 5); 
        if (score > 8) score = 8;
        
        // Construct a "Scenario-like" object from template
        scenario = {
            offset,
            score,
            summary: template.summary,
            dialogues: [{
                user: template.user,
                ai: isKo 
                    ? `### 🔍 분석\n* **원인**: ${template.hormoneDesc}\n### 💊 처방\n* **${template.nutrient}** 섭취를 권장합니다.`
                    : `### 🔍 Analysis\n* **Cause**: ${template.hormoneDesc}\n### 💊 Advice\n* Recommend **${template.nutrient}**.`
            }],
            medical: {
                hormone: template.hormone,
                hormoneDesc: template.hormoneDesc,
                suggestion: template.suggestion,
                nutrient: template.nutrient
            },
            guides: [{
                type: ['health', 'physical'].includes(template.actionCat) ? 'physical' : 'mental',
                icon: template.guideIcon,
                title: template.guideTitle,
                exercise: template.guideEx,
                tip: isKo ? "꾸준히 실천하세요" : "Consistency is key"
            }],
            actions: [{
                id: `act-${offset}`,
                title: template.actionTitle,
                description: isKo ? "오늘의 작은 실천" : "Today's micro action",
                category: template.actionCat as any,
                difficulty: 'easy',
                estimated_time: '5min',
                completed: offset > 0 
            }],
            tags: { health: [template.hormone.split(' ')[0]], career: [] }
        };
    }

    const dateStr = getRelativeDate(offset);

    // Enrich Data with Pre-generated Rich Details (Deep Dive Content)
    const enrichedGuides = scenario.guides.map(g => ({ ...g, detail: getMockRichDetail(g.title, language) }));
    
    const enrichedMedical = { 
        ...scenario.medical, 
        detail: getMockRichDetail(scenario.medical.hormone, language) 
    };
    
    const enrichedActions = scenario.actions.map((a, idx) => ({ 
        ...a, 
        detail: getMockRichDetail(a.title, language) 
    }));

    const summary: DailySummary = {
        date: dateStr,
        summary: scenario.summary,
        sentimentScore: scenario.score,
        healthTags: scenario.tags.health,
        careerTags: scenario.tags.career,
        keyFact: isKo ? "집중 케어 필요" : "Intensive Care Needed",
        medicalAnalysis: enrichedMedical,
        customGuide: enrichedGuides,
        isGenerated: true 
    };

    const logs: MemoryLog[] = scenario.dialogues.map((d, index) => ({
        id: `demo-log-${dateStr}-${index}`,
        timestamp: `${dateStr}T${10 + index}:00:00.000Z`,
        time: `${10 + index}:00:00`,
        userMessage: d.user,
        aiResponse: d.ai
    }));

    const completedCount = enrichedActions.filter(i => i.completed).length;
    const rate = Math.round((completedCount / enrichedActions.length) * 100);
    let status: 'green' | 'yellow' | 'red' = 'red';
    if (rate >= 80) status = 'green';
    else if (rate >= 40) status = 'yellow';

    const checklist: DailyChecklist = {
        date: dateStr,
        items: enrichedActions,
        completionRate: rate,
        status: status
    };

    return { summary, logs, checklist };
};

export const generateDemoBackup = (language: Language = 'ko'): string => {
    const isKo = language === 'ko';
    
    const baseProfile = isKo ? INITIAL_PROFILE_KO : INITIAL_PROFILE_EN;
    const userProfile = { ...baseProfile, lastActive: new Date().toISOString() };

    const summaries: DailySummary[] = [];
    const checklists: DailyChecklist[] = [];
    const logsMap: Record<string, string> = {};

    // Generate 14 Days of Scenarios (Including both Fixed and Procedural)
    for (let i = 0; i < 14; i++) {
        const data = getDemoScenario(i, language);
        if (data) {
            summaries.push(data.summary);
            checklists.push(data.checklist);
            logsMap[`reboot_logs_${data.summary.date}`] = JSON.stringify(data.logs);
        }
    }

    const backupData = {
        "reboot_user_profile": JSON.stringify(userProfile),
        "reboot_memory_index": JSON.stringify(summaries),
        "reboot_checklists": JSON.stringify(checklists),
        ...logsMap
    };

    return JSON.stringify(backupData);
};
