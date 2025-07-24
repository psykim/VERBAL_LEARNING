import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { X, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const CERADMemoryTest = () => {
  // 단어 목록 (고정된 10개 단어)
  const wordList = ['우유', '팔', '바다', '편지', '왕', '가구', '지붕', '붓', '싹', '기계'];
  
  // 각 시행별 제시 순서
  const presentationOrders = {
    trial1: ['우유', '팔', '바다', '편지', '왕', '가구', '지붕', '붓', '싹', '기계'],
    trial2: ['붓', '가구', '우유', '바다', '기계', '팔', '왕', '편지', '지붕', '싹'],
    trial3: ['왕', '싹', '팔', '가구', '지붕', '바다', '우유', '기계', '붓', '편지']
  };
  
  // 재인 검사 단어 순서 (10개 목표 + 10개 방해자극)
  const recognitionWords = [
    '교회', '콜라', '우유', '돈', '팔', '바다', '다섯', '편지', '호텔', '산',
    '왕', '가구', '신발', '지붕', '마을', '줄', '붓', '군대', '싹', '기계'
  ];
  
  // 방해자극 단어
  const distractorWords = ['교회', '콜라', '돈', '다섯', '호텔', '산', '신발', '마을', '줄', '군대'];
  
  // 기본 정보
  const [demographics, setDemographics] = useState({
    age: '',
    education: '',
    gender: 'M'
  });
  
  // 시행별 반응 (단어와 순서 저장)
  const [trial1Responses, setTrial1Responses] = useState([]);
  const [trial2Responses, setTrial2Responses] = useState([]);
  const [trial3Responses, setTrial3Responses] = useState([]);
  const [delayedResponses, setDelayedResponses] = useState([]);
  
  // 현재 활성화된 시행
  const [activeTrial, setActiveTrial] = useState('trial1');
  
  // 재인 반응 (0: 부정, 1: 긍정)
  const [recognition, setRecognition] = useState(Array(20).fill(null));
  
  // 결과
  const [results, setResults] = useState(null);
  
  // 팝업 상태
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', description: '' });
  
  // 연령별 규준 데이터 (한국 규준)
  const norms = {
    '50-59': { immediate: { mean: 22.5, sd: 3.2 }, delayed: { mean: 7.2, sd: 1.8 }, recognition: { mean: 19.5, sd: 0.8 } },
    '60-69': { immediate: { mean: 20.3, sd: 3.5 }, delayed: { mean: 6.5, sd: 2.0 }, recognition: { mean: 19.2, sd: 1.0 } },
    '70-79': { immediate: { mean: 17.8, sd: 3.8 }, delayed: { mean: 5.5, sd: 2.2 }, recognition: { mean: 18.8, sd: 1.3 } },
    '80+': { immediate: { mean: 15.2, sd: 4.0 }, delayed: { mean: 4.2, sd: 2.3 }, recognition: { mean: 18.0, sd: 1.8 } }
  };
  
  // 점수 설명 데이터
  const scoreDescriptions = {
    // 기본 점수
    trial1: {
      title: "시행 1 점수",
      description: "첫 번째 학습 시행에서 정확하게 회상한 단어의 개수입니다.\n\n산출방법: 제시된 10개 단어 중 정확하게 회상한 단어 수\n\n임상적 의미: 초기 학습 능력과 즉각적 기억 용량을 평가합니다. 정상 범위는 연령에 따라 다르며, 일반적으로 4-7개입니다."
    },
    trial2: {
      title: "시행 2 점수",
      description: "두 번째 학습 시행에서 정확하게 회상한 단어의 개수입니다.\n\n산출방법: 제시된 10개 단어 중 정확하게 회상한 단어 수\n\n임상적 의미: 반복 학습을 통한 개선 정도를 평가합니다. 시행 1보다 1-3개 증가하는 것이 정상입니다."
    },
    trial3: {
      title: "시행 3 점수",
      description: "세 번째 학습 시행에서 정확하게 회상한 단어의 개수입니다.\n\n산출방법: 제시된 10개 단어 중 정확하게 회상한 단어 수\n\n임상적 의미: 최대 학습 능력을 평가합니다. 이 점수가 지연 회상의 기준점이 됩니다."
    },
    totalLearning: {
      title: "총 학습량",
      description: "3회 시행 동안 회상한 단어의 총합입니다.\n\n산출방법: 시행1 + 시행2 + 시행3\n\n임상적 의미: 전반적인 학습 능력을 평가합니다. 연령별 정상 범위와 비교하여 기억 장애 여부를 판단합니다."
    },
    delayedRecall: {
      title: "지연 회상",
      description: "5-10분 후 단서 없이 회상한 단어의 개수입니다.\n\n산출방법: 지연 후 정확하게 회상한 단어 수\n\n임상적 의미: 정보의 고착과 인출 능력을 평가합니다. 최대 학습의 70% 이상 유지가 정상입니다."
    },
    recognitionTotal: {
      title: "재인 정확도",
      description: "재인 검사에서 정확하게 판별한 단어의 총 개수입니다.\n\n산출방법: 정확한 긍정(적중) + 정확한 부정(정확기각)\n\n임상적 의미: 저장된 정보를 인식하는 능력을 평가합니다. 18/20 이상이 정상 범위입니다."
    },
    hits: {
      title: "적중 (Hits)",
      description: "목표 단어를 정확하게 '예'라고 인식한 개수입니다.\n\n산출방법: 10개 목표 단어 중 '예'라고 응답한 수\n\n임상적 의미: 학습한 정보를 정확히 인식하는 능력을 나타냅니다. 9-10개가 정상입니다."
    },
    correctRejections: {
      title: "정확 기각",
      description: "방해자극을 정확하게 '아니오'라고 거부한 개수입니다.\n\n산출방법: 10개 방해자극 중 '아니오'라고 응답한 수\n\n임상적 의미: 간섭 자극을 배제하는 능력을 평가합니다. 9-10개가 정상입니다."
    },
    
    // 학습 지표
    learningSlope: {
      title: "학습 기울기",
      description: "첫 시행과 마지막 시행 간의 개선 정도입니다.\n\n산출방법: 시행3 - 시행1\n\n임상적 의미: 양수값은 학습이 일어났음을 의미합니다. 2-4가 정상 범위이며, 0 이하는 학습 장애를 시사합니다."
    },
    learningRate: {
      title: "학습률",
      description: "첫 시행 대비 학습 개선의 백분율입니다.\n\n산출방법: ((시행3 - 시행1) / 시행1) × 100\n\n임상적 의미: 50-100%가 정상 범위입니다. 낮은 학습률은 새로운 정보 습득의 어려움을 나타냅니다."
    },
    learningEfficiency: {
      title: "학습 효율성",
      description: "평균적인 시행 간 개선 정도입니다.\n\n산출방법: (시행3 - 시행1) / 2\n\n임상적 의미: 1 이상이 정상입니다. SRT 검사에서 차용한 지표로, 학습의 일관성을 평가합니다."
    },
    
    // 기억 보유 지표
    savingsScore: {
      title: "절약 점수",
      description: "최대 학습 대비 지연 회상의 비율입니다.\n\n산출방법: (지연회상 / 최대학습) × 100\n\n임상적 의미: CERAD 고유 지표로, 70% 이상이 정상입니다. 50% 미만은 가속화된 망각을 의미합니다."
    },
    forgettingRate: {
      title: "망각률",
      description: "최대 학습 후 잊어버린 정보의 비율입니다.\n\n산출방법: ((최대학습 - 지연회상) / 최대학습) × 100\n\n임상적 의미: 30% 이하가 정상입니다. 높은 망각률은 해마 손상을 시사할 수 있습니다."
    },
    retentionIndex: {
      title: "보유 지수",
      description: "최고 학습 시점 대비 지연 회상 비율입니다.\n\n산출방법: (지연회상 / MAX(시행2, 시행3)) × 100\n\n임상적 의미: HVLT-R에서 차용한 지표로, 85% 이상이 우수, 70-85%가 정상입니다."
    },
    retrievalEfficiency: {
      title: "인출 효율성",
      description: "저장된 정보를 인출하는 효율성입니다.\n\n산출방법: (지연회상 / 최대학습) × 100\n\n임상적 의미: 절약점수와 유사하나 인출 과정에 초점을 둡니다. 낮은 점수는 인출 결함을 시사합니다."
    },
    consistencyPercent: {
      title: "일관성 비율",
      description: "시행 간 동일한 단어를 일관되게 회상하는 정도입니다.\n\n산출방법: (연속 시행간 공통 회상 단어 / 총 회상) × 100\n\n임상적 의미: CVLT에서 차용한 지표로, 70% 이상이 정상입니다. 낮은 일관성은 불안정한 학습을 의미합니다."
    },
    
    // 재인 분석
    dPrime: {
      title: "d' (변별력)",
      description: "신호탐지이론에 기반한 재인 변별 능력입니다.\n\n산출방법: Z(적중률) - Z(오경보율)\n\n임상적 의미: 2.5 이상이 정상입니다. 1.5 미만은 저장 결함을, 높은 d'은 인출 결함을 시사합니다."
    },
    beta: {
      title: "β (반응 편향)",
      description: "재인 검사에서의 응답 경향성입니다.\n\n산출방법: exp((Z(오경보)² - Z(적중)²) / 2)\n\n임상적 의미: 1에 가까울수록 균형잡힌 반응입니다. 1보다 크면 보수적, 작으면 자유로운 반응 경향을 나타냅니다."
    },
    recognitionEfficiency: {
      title: "재인 효율성",
      description: "재인과 자유회상 간의 차이입니다.\n\n산출방법: 적중 - 지연회상\n\n임상적 의미: SVLT에서 차용한 지표로, 3 이상은 인출 결함을, 0-2는 저장 결함을 시사합니다."
    },
    
    // 오류 분석
    intrusions: {
      title: "침입 오류",
      description: "목록에 없는 단어를 회상한 횟수입니다.\n\n산출방법: 10개 목표 단어가 아닌 단어를 말한 총 횟수\n\n임상적 의미: 5개 이하가 정상입니다. 증가된 침입은 전두엽 기능 저하나 혼동을 시사합니다."
    },
    repetitions: {
      title: "반복 오류",
      description: "같은 시행 내에서 단어를 반복한 횟수입니다.\n\n산출방법: 각 시행 내 중복 응답 수의 합\n\n임상적 의미: 2개 이하가 정상입니다. 증가된 반복은 모니터링 능력 저하를 의미합니다."
    },
    
    // 계열 위치 효과
    primacyEffect: {
      title: "초두 효과",
      description: "회상 초반부(1-3번째)에 나온 단어의 비율입니다.\n\n산출방법: (1-3번째 회상 단어 / 총 정확 회상) × 100\n\n임상적 의미: 정상적으로는 40% 이상입니다. 감소는 장기 기억 전환의 어려움을 시사합니다."
    },
    recencyEffect: {
      title: "최신 효과",
      description: "회상 후반부(8-10번째)에 나온 단어의 비율입니다.\n\n산출방법: (8-10번째 회상 단어 / 총 정확 회상) × 100\n\n임상적 의미: 정상적으로는 30% 이상입니다. 감소는 단기 기억 저장의 문제를 시사합니다."
    },
    
    // 표준화 점수
    zScore: {
      title: "Z 점수",
      description: "연령 규준 대비 표준편차 단위의 점수입니다.\n\n산출방법: (원점수 - 연령평균) / 표준편차\n\n임상적 의미:\n• 0 이상: 정상\n• -1.0 ~ 0: 경계선\n• -1.5 ~ -1.0: 경미한 손상\n• -2.0 ~ -1.5: 중등도 손상\n• -2.0 미만: 심각한 손상"
    },
    tScore: {
      title: "T 점수",
      description: "평균 50, 표준편차 10으로 변환한 표준점수입니다.\n\n산출방법: 50 + (Z점수 × 10)\n\n임상적 의미:\n• 45-55: 평균 범위\n• 40-44: 경미한 저하\n• 30-39: 중등도 저하\n• 30 미만: 심각한 저하"
    },
    percentile: {
      title: "백분위",
      description: "동일 연령대에서의 상대적 위치입니다.\n\n산출방법: 정규분포 누적확률 × 100\n\n임상적 의미:\n• 25%ile 이상: 정상\n• 16-24%ile: 경계선\n• 9-15%ile: 경미한 손상\n• 3-8%ile: 중등도 손상\n• 2%ile 이하: 심각한 손상"
    },
    
    // 추가 지표
    firstTrialMemory: {
      title: "첫 시행 기억",
      description: "첫 번째 시행에서의 즉각 회상 능력입니다.\n\n산출방법: 시행1 점수\n\n임상적 의미: PAL에서 차용한 개념으로, 4개 이상이 정상입니다. 초기 부호화 능력을 반영합니다."
    },
    estimatedLTS: {
      title: "추정 장기저장",
      description: "3회 시행 모두에서 일관되게 회상된 단어 수입니다.\n\n산출방법: 시행1, 2, 3 모두에서 회상된 단어 수\n\n임상적 의미: SRT에서 차용한 개념으로, 안정적으로 저장된 정보량을 추정합니다."
    },
    contrastScaledScore: {
      title: "대조 척도점수",
      description: "기대 지연회상 대비 실제 수행입니다.\n\n산출방법: 12 + ((실제지연 - 기대지연) / 2)\n기대지연 = 총학습 × 0.75\n\n임상적 의미: WMS에서 차용한 개념으로, 12가 평균이며 9-15가 정상 범위입니다."
    },
    cueingEffect: {
      title: "단서 효과",
      description: "재인이 자유회상보다 나은 정도입니다.\n\n산출방법: 재인적중 - 지연회상\n\n임상적 의미: FCSRT 개념을 응용한 것으로, 3 이상은 인출 결함을, 0-2는 저장 결함을 시사합니다."
    },
    recallStrategy: {
      title: "회상 전략",
      description: "단어를 회상하는 순서의 패턴입니다.\n\n분석방법: 제시 순서와 회상 순서의 일치도 분석\n\n임상적 의미: 계열적 전략은 효율적 학습을, 무작위 전략은 비조직적 학습을 나타냅니다."
    }
  };
  
  // 점수 설명 표시 함수
  const showScoreDescription = (scoreKey) => {
    const description = scoreDescriptions[scoreKey];
    if (description) {
      setPopupContent(description);
      setPopupOpen(true);
    }
  };
  
  // 단어 클릭 처리
  const handleWordClick = (word, trial) => {
    let responses, setResponses;
    
    switch(trial) {
      case 'trial1':
        responses = trial1Responses;
        setResponses = setTrial1Responses;
        break;
      case 'trial2':
        responses = trial2Responses;
        setResponses = setTrial2Responses;
        break;
      case 'trial3':
        responses = trial3Responses;
        setResponses = setTrial3Responses;
        break;
      case 'delayed':
        responses = delayedResponses;
        setResponses = setDelayedResponses;
        break;
    }
    
    // 이미 선택된 단어인지 확인
    const existingIndex = responses.findIndex(r => r.word === word);
    
    if (existingIndex === -1) {
      // 새로운 단어 추가
      setResponses([...responses, { 
        word: word, 
        order: responses.length + 1,
        presentationOrder: presentationOrders[trial]?.indexOf(word) + 1 || null
      }]);
    } else {
      // 이미 선택된 단어 제거
      setResponses(responses.filter(r => r.word !== word));
    }
  };
  
  // 반응 초기화
  const clearTrial = (trial) => {
    switch(trial) {
      case 'trial1':
        setTrial1Responses([]);
        break;
      case 'trial2':
        setTrial2Responses([]);
        break;
      case 'trial3':
        setTrial3Responses([]);
        break;
      case 'delayed':
        setDelayedResponses([]);
        break;
    }
  };
  
  // 선택된 단어 제거
  const removeWord = (word, trial) => {
    let responses, setResponses;
    
    switch(trial) {
      case 'trial1':
        responses = trial1Responses;
        setResponses = setTrial1Responses;
        break;
      case 'trial2':
        responses = trial2Responses;
        setResponses = setTrial2Responses;
        break;
      case 'trial3':
        responses = trial3Responses;
        setResponses = setTrial3Responses;
        break;
      case 'delayed':
        responses = delayedResponses;
        setResponses = setDelayedResponses;
        break;
    }
    
    setResponses(responses.filter(r => r.word !== word));
  };
  
  const calculateResults = () => {
    // 기본 점수 계산
    const t1Score = trial1Responses.filter(r => wordList.includes(r.word)).length;
    const t2Score = trial2Responses.filter(r => wordList.includes(r.word)).length;
    const t3Score = trial3Responses.filter(r => wordList.includes(r.word)).length;
    const delayedScore = delayedResponses.filter(r => wordList.includes(r.word)).length;
    
    // 재인 점수 계산
    let hits = 0;
    let correctRejections = 0;
    let falseAlarms = 0;
    let misses = 0;
    
    recognitionWords.forEach((word, idx) => {
      if (wordList.includes(word)) {
        if (recognition[idx] === 1) hits++;
        else if (recognition[idx] === 0) misses++;
      } else {
        if (recognition[idx] === 0) correctRejections++;
        else if (recognition[idx] === 1) falseAlarms++;
      }
    });
    
    // 1. 기본 측정치
    const totalLearning = t1Score + t2Score + t3Score;
    const maxLearning = Math.max(t1Score, t2Score, t3Score);
    const learningSlope = t3Score - t1Score;
    
    // 2. 절약 점수 (CERAD 고유)
    const savingsScore = maxLearning > 0 ? (delayedScore / maxLearning) * 100 : 0;
    
    // 3. 망각률 (RAVLT 방식)
    const forgettingRate = maxLearning > 0 ? ((maxLearning - delayedScore) / maxLearning) * 100 : 0;
    
    // 4. 학습률 (RAVLT 방식)
    const learningRate = t1Score > 0 ? ((t3Score - t1Score) / t1Score) * 100 : 0;
    
    // 5. 재인 지표들
    const recognitionTotal = hits + correctRejections;
    const hitRate = hits / 10;
    const falseAlarmRate = falseAlarms / 10;
    
    // d' (신호탐지이론)
    const zHit = hitRate === 1 ? 2.5 : hitRate === 0 ? -2.5 : normalInverse(hitRate);
    const zFA = falseAlarmRate === 1 ? 2.5 : falseAlarmRate === 0 ? -2.5 : normalInverse(falseAlarmRate);
    const dPrime = zHit - zFA;
    
    // 반응 편향 (β)
    const beta = Math.exp((Math.pow(zFA, 2) - Math.pow(zHit, 2)) / 2);
    
    // 6. 학습 일관성 (CVLT 방식)
    let consistency = 0;
    const t1Words = trial1Responses.filter(r => wordList.includes(r.word)).map(r => r.word);
    const t2Words = trial2Responses.filter(r => wordList.includes(r.word)).map(r => r.word);
    const t3Words = trial3Responses.filter(r => wordList.includes(r.word)).map(r => r.word);
    
    t1Words.forEach(word => {
      if (t2Words.includes(word)) consistency++;
    });
    t2Words.forEach(word => {
      if (t3Words.includes(word)) consistency++;
    });
    
    const consistencyPercent = totalLearning > 0 ? (consistency / (totalLearning - t1Score)) * 100 : 0;
    
    // 7. 오류 분석
    const allResponses = [
      ...trial1Responses.map(r => r.word),
      ...trial2Responses.map(r => r.word),
      ...trial3Responses.map(r => r.word),
      ...delayedResponses.map(r => r.word)
    ];
    const intrusions = allResponses.filter(word => word && !wordList.includes(word)).length;
    const repetitions = countRepetitions([trial1Responses, trial2Responses, trial3Responses, delayedResponses]);
    
    // 8. 계열 위치 효과 (회상 순서 기반 분석)
    const serialPosition = calculateSerialPositionWithOrder([trial1Responses, trial2Responses, trial3Responses]);
    
    // 9. 학습 효율성 (SRT 방식)
    const learningEfficiency = (t3Score - t1Score) / 2;
    
    // 10. 인출 효율성
    const retrievalEfficiency = maxLearning > 0 ? (delayedScore / maxLearning) * 100 : 0;
    
    // 11. 보유 지수 (HVLT-R 방식)
    const retentionIndex = Math.max(t2Score, t3Score) > 0 ? 
      (delayedScore / Math.max(t2Score, t3Score)) * 100 : 0;
    
    // 12. 재인 효율성 (SVLT 방식)
    const recognitionEfficiency = hits - delayedScore;
    
    // 13. 회상 순서 분석
    const recallOrderAnalysis = analyzeRecallOrder([trial1Responses, trial2Responses, trial3Responses]);
    
    // 14. 연령/교육 보정
    const ageGroup = getAgeGroup(demographics.age);
    const zScores = calculateZScores(totalLearning, delayedScore, recognitionTotal, ageGroup);
    const tScores = {
      immediate: 50 + (zScores.immediate * 10),
      delayed: 50 + (zScores.delayed * 10),
      recognition: 50 + (zScores.recognition * 10)
    };
    
    // 15. 백분위
    const percentiles = {
      immediate: normalCDF(zScores.immediate) * 100,
      delayed: normalCDF(zScores.delayed) * 100,
      recognition: normalCDF(zScores.recognition) * 100
    };
    
    // 16. 임상적 해석
    const interpretation = generateInterpretation(zScores, savingsScore, dPrime, intrusions);
    
    // 17. 추가 지표들
    const additionalMetrics = {
      // FCSRT 방식 - 단서 효과 (재인이 단서 역할)
      cueingEffect: recognitionEfficiency,
      
      // PAL 방식 - 첫 시행 기억 점수
      firstTrialMemory: t1Score,
      
      // SRT 방식 - 장기 저장 추정
      estimatedLTS: t1Words.filter(word => t2Words.includes(word) && t3Words.includes(word)).length,
      
      // WRAML 방식 - 학습 곡선 패턴
      learningPattern: categorizeLearningCurve(t1Score, t2Score, t3Score),
      
      // WMS 방식 - 대조 척도점수
      contrastScaledScore: calculateContrastScore(totalLearning, delayedScore),
      
      // 회상 순서 기반 전략 분석
      recallStrategy: recallOrderAnalysis.strategy
    };
    
    setResults({
      // 기본 점수
      scores: {
        trial1: t1Score,
        trial2: t2Score,
        trial3: t3Score,
        totalLearning,
        maxLearning,
        delayedRecall: delayedScore,
        recognition: {
          hits,
          correctRejections,
          falseAlarms,
          misses,
          total: recognitionTotal
        }
      },
      
      // 파생 지표
      derived: {
        learningSlope,
        learningRate,
        learningEfficiency,
        savingsScore,
        forgettingRate,
        retentionIndex,
        retrievalEfficiency,
        consistencyPercent,
        recognitionEfficiency,
        dPrime,
        beta,
        cueingEffect: additionalMetrics.cueingEffect
      },
      
      // 오류 분석
      errors: {
        intrusions,
        repetitions,
        intrusionRate: (intrusions / (totalLearning + delayedScore + intrusions)) * 100,
        repetitionRate: (repetitions / (totalLearning + delayedScore)) * 100
      },
      
      // 계열 위치 효과
      serialPosition,
      
      // 회상 순서 분석
      recallOrder: recallOrderAnalysis,
      
      // 표준화 점수
      standardScores: {
        zScores,
        tScores,
        percentiles
      },
      
      // 추가 지표
      additional: additionalMetrics,
      
      // 임상적 해석
      interpretation
    });
  };
  
  // 보조 함수들
  const getAgeGroup = (age) => {
    const ageNum = parseInt(age);
    if (ageNum < 60) return '50-59';
    if (ageNum < 70) return '60-69';
    if (ageNum < 80) return '70-79';
    return '80+';
  };
  
  const calculateZScores = (immediate, delayed, recognition, ageGroup) => {
    const norm = norms[ageGroup];
    return {
      immediate: (immediate - norm.immediate.mean) / norm.immediate.sd,
      delayed: (delayed - norm.delayed.mean) / norm.delayed.sd,
      recognition: (recognition - norm.recognition.mean) / norm.recognition.sd
    };
  };
  
  const normalInverse = (p) => {
    // 간단한 정규분포 역함수 근사
    const a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969;
    const a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
    const b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887;
    const b4 = 66.8013118877197, b5 = -13.2806815528857;
    const c1 = -0.00778489400243029, c2 = -0.322396458041136, c3 = -2.40075827716184;
    const c4 = -2.54973253934373, c5 = 4.37466414146497, c6 = 2.93816398269878;
    
    if (p < 0.02425) {
      const q = Math.sqrt(-2 * Math.log(p));
      return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / 
             ((((b1 * q + b2) * q + b3) * q + b4) * q + b5) * q + 1;
    } else if (p < 0.97575) {
      const q = p - 0.5;
      const r = q * q;
      return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
             (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
      const q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
              ((((b1 * q + b2) * q + b3) * q + b4) * q + b5) * q + 1;
    }
  };
  
  const normalCDF = (z) => {
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    const p = 0.2316419;
    const c = 0.39894228;
    
    if (z >= 0.0) {
      const t = 1.0 / (1.0 + p * z);
      return 1.0 - c * Math.exp(-z * z / 2.0) * t * 
             (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
    } else {
      const t = 1.0 / (1.0 - p * z);
      return c * Math.exp(-z * z / 2.0) * t * 
             (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
    }
  };
  
  const countRepetitions = (trials) => {
    let count = 0;
    trials.forEach(trial => {
      const seen = {};
      trial.forEach(response => {
        if (response.word && wordList.includes(response.word)) {
          if (seen[response.word]) count++;
          else seen[response.word] = true;
        }
      });
    });
    return count;
  };
  
  const calculateSerialPositionWithOrder = (trials) => {
    const positions = { primacy: 0, middle: 0, recency: 0 };
    const counts = { primacy: 0, middle: 0, recency: 0 };
    
    // 제시 순서가 아닌 회상 순서 기반 분석
    trials.forEach(trial => {
      trial.forEach(response => {
        if (wordList.includes(response.word)) {
          const recallOrder = response.order;
          if (recallOrder <= 3) {
            positions.primacy++;
          } else if (recallOrder <= 7) {
            positions.middle++;
          } else {
            positions.recency++;
          }
        }
      });
    });
    
    const totalCorrect = trials.reduce((sum, trial) => 
      sum + trial.filter(r => wordList.includes(r.word)).length, 0);
    
    return {
      primacyEffect: totalCorrect > 0 ? (positions.primacy / totalCorrect) * 100 : 0,
      middleRecall: totalCorrect > 0 ? (positions.middle / totalCorrect) * 100 : 0,
      recencyEffect: totalCorrect > 0 ? (positions.recency / totalCorrect) * 100 : 0
    };
  };
  
  const analyzeRecallOrder = (trials) => {
    let forwardRecall = 0;
    let semanticClustering = 0;
    let randomRecall = 0;
    
    trials.forEach((trial, trialIndex) => {
      const presentOrder = Object.values(presentationOrders)[trialIndex];
      const correctResponses = trial.filter(r => wordList.includes(r.word));
      
      for (let i = 0; i < correctResponses.length - 1; i++) {
        const currentWord = correctResponses[i].word;
        const nextWord = correctResponses[i + 1].word;
        
        const currentPresentIndex = presentOrder.indexOf(currentWord);
        const nextPresentIndex = presentOrder.indexOf(nextWord);
        
        if (nextPresentIndex === currentPresentIndex + 1) {
          forwardRecall++;
        }
      }
    });
    
    const strategy = forwardRecall > randomRecall ? '계열적 전략' : '무작위 전략';
    
    return {
      forwardRecall,
      semanticClustering,
      randomRecall,
      strategy
    };
  };
  
  const categorizeLearningCurve = (t1, t2, t3) => {
    const slope1 = t2 - t1;
    const slope2 = t3 - t2;
    
    if (slope1 > 2 && slope2 > 1) return '급격한 상승';
    if (slope1 > 1 && slope2 >= 0) return '정상적 학습';
    if (slope1 >= 0 && slope2 >= 0 && slope1 + slope2 < 2) return '완만한 학습';
    if (slope1 < 0 || slope2 < 0) return '불규칙한 학습';
    return '평탄한 학습';
  };
  
  const calculateContrastScore = (immediate, delayed) => {
    const expectedDelayed = immediate * 0.75; // 기대 지연회상
    const difference = delayed - expectedDelayed;
    
    if (difference >= 0) return 12 + Math.min(3, Math.floor(difference / 2));
    else return 12 + Math.max(-3, Math.floor(difference / 2));
  };
  
  const generateInterpretation = (zScores, savings, dPrime, intrusions) => {
    const interpretations = [];
    
    // 전반적 수행 수준
    if (zScores.immediate < -2) {
      interpretations.push('즉각 기억에서 심각한 손상이 관찰됩니다.');
    } else if (zScores.immediate < -1.5) {
      interpretations.push('즉각 기억에서 중등도 손상이 관찰됩니다.');
    } else if (zScores.immediate < -1) {
      interpretations.push('즉각 기억에서 경미한 손상이 관찰됩니다.');
    }
    
    // 망각 패턴
    if (savings < 50) {
      interpretations.push('가속화된 망각이 시사되며, 이는 해마 기능 장애를 나타낼 수 있습니다.');
    } else if (savings > 90) {
      interpretations.push('우수한 정보 보유를 보이고 있습니다.');
    }
    
    // 재인 패턴
    if (dPrime < 1.5) {
      interpretations.push('재인 변별력이 저하되어 있어 저장 결함을 시사합니다.');
    } else if (dPrime > 3.0) {
      interpretations.push('재인 수행이 양호하여 인출 결함 패턴을 보입니다.');
    }
    
    // 오류 패턴
    if (intrusions > 5) {
      interpretations.push('침입 오류가 증가되어 있어 전두엽 기능 저하가 의심됩니다.');
    }
    
    // 진단적 시사점
    if (zScores.immediate < -1.5 && savings < 60 && dPrime < 2) {
      interpretations.push('알츠하이머병 가능성을 시사하는 기억 프로파일을 보입니다.');
    } else if (zScores.immediate < -1 && savings > 80 && intrusions > 3) {
      interpretations.push('전두엽/피질하 유형의 기억 장애 패턴을 보입니다.');
    }
    
    return interpretations;
  };
  
  // 현재 시행에 대한 반응 가져오기
  const getCurrentResponses = () => {
    switch(activeTrial) {
      case 'trial1': return trial1Responses;
      case 'trial2': return trial2Responses;
      case 'trial3': return trial3Responses;
      case 'delayed': return delayedResponses;
      default: return [];
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">CERAD 기억검사 종합 분석 프로그램</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="input">
            <TabsList>
              <TabsTrigger value="input">검사 입력</TabsTrigger>
              <TabsTrigger value="results">결과 분석</TabsTrigger>
            </TabsList>
            
            <TabsContent value="input" className="space-y-6">
              {/* 기본 정보 입력 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>연령</Label>
                  <Input
                    type="number"
                    value={demographics.age}
                    onChange={(e) => setDemographics({...demographics, age: e.target.value})}
                    placeholder="연령 입력"
                  />
                </div>
                <div>
                  <Label>교육년수</Label>
                  <Input
                    type="number"
                    value={demographics.education}
                    onChange={(e) => setDemographics({...demographics, education: e.target.value})}
                    placeholder="교육년수"
                  />
                </div>
                <div>
                  <Label>성별</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={demographics.gender}
                    onChange={(e) => setDemographics({...demographics, gender: e.target.value})}
                  >
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                  </select>
                </div>
              </div>
              
              {/* 즉각 회상 시행 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">회상 검사</h3>
                
                <Tabs value={activeTrial} onValueChange={setActiveTrial}>
                  <TabsList>
                    <TabsTrigger value="trial1">시행 1</TabsTrigger>
                    <TabsTrigger value="trial2">시행 2</TabsTrigger>
                    <TabsTrigger value="trial3">시행 3</TabsTrigger>
                    <TabsTrigger value="delayed">지연 회상</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTrial} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        피검자가 회상한 순서대로 단어를 클릭하세요.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => clearTrial(activeTrial)}
                      >
                        초기화
                      </Button>
                    </div>
                    
                    {/* 단어 버튼 그리드 */}
                    <div className="grid grid-cols-5 gap-2">
                      {(activeTrial !== 'delayed' ? presentationOrders[activeTrial] : wordList).map((word) => {
                        const responses = getCurrentResponses();
                        const response = responses.find(r => r.word === word);
                        const isSelected = !!response;
                        
                        return (
                          <Button
                            key={word}
                            variant={isSelected ? "default" : "outline"}
                            className="relative"
                            onClick={() => handleWordClick(word, activeTrial)}
                          >
                            {word}
                            {isSelected && (
                              <Badge 
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center"
                                variant="secondary"
                              >
                                {response.order}
                              </Badge>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* 선택된 단어 목록 */}
                    <div>
                      <Label>회상된 단어 (순서대로)</Label>
                      <div className="mt-2 p-3 border rounded-lg min-h-[60px]">
                        {getCurrentResponses().length === 0 ? (
                          <p className="text-sm text-gray-500">선택된 단어가 없습니다.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {getCurrentResponses()
                              .sort((a, b) => a.order - b.order)
                              .map((response) => (
                                <Badge 
                                  key={response.order} 
                                  variant={wordList.includes(response.word) ? "default" : "destructive"}
                                  className="flex items-center gap-1"
                                >
                                  {response.order}. {response.word}
                                  <X 
                                    className="h-3 w-3 cursor-pointer" 
                                    onClick={() => removeWord(response.word, activeTrial)}
                                  />
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* 재인 검사 */}
              <div>
                <h3 className="text-lg font-semibold">재인 검사</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {recognitionWords.map((word, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{word}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={recognition[idx] === 1 ? "default" : "outline"}
                          onClick={() => {
                            const newRec = [...recognition];
                            newRec[idx] = 1;
                            setRecognition(newRec);
                          }}
                        >
                          예
                        </Button>
                        <Button
                          size="sm"
                          variant={recognition[idx] === 0 ? "default" : "outline"}
                          onClick={() => {
                            const newRec = [...recognition];
                            newRec[idx] = 0;
                            setRecognition(newRec);
                          }}
                        >
                          아니오
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button onClick={calculateResults} className="w-full">
                결과 분석
              </Button>
            </TabsContent>
            
            <TabsContent value="results">
              {results ? (
                <div className="space-y-6">
                  {/* 기본 점수 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">기본 점수</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('trial1')}
                          >
                            시행 1 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-2xl font-bold">{results.scores.trial1}/10</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('trial2')}
                          >
                            시행 2 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-2xl font-bold">{results.scores.trial2}/10</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('trial3')}
                          >
                            시행 3 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-2xl font-bold">{results.scores.trial3}/10</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('totalLearning')}
                          >
                            총 학습량 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-2xl font-bold">{results.scores.totalLearning}/30</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('delayedRecall')}
                          >
                            지연 회상 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-2xl font-bold">{results.scores.delayedRecall}/10</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('recognitionTotal')}
                          >
                            재인 정확 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-2xl font-bold">{results.scores.recognition.total}/20</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('hits')}
                          >
                            적중 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-2xl font-bold">{results.scores.recognition.hits}/10</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('correctRejections')}
                          >
                            정확 기각 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-2xl font-bold">{results.scores.recognition.correctRejections}/10</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 학습 및 기억 지표 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">학습 및 기억 지표</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('learningSlope')}
                          >
                            학습 기울기 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.learningSlope}</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('learningRate')}
                          >
                            학습률 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.learningRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('learningEfficiency')}
                          >
                            학습 효율성 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.learningEfficiency.toFixed(1)}</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('savingsScore')}
                          >
                            절약 점수 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.savingsScore.toFixed(1)}%</p>
                          <Badge variant={results.derived.savingsScore < 50 ? "destructive" : "default"}>
                            {results.derived.savingsScore < 50 ? "가속 망각" : "정상"}
                          </Badge>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('forgettingRate')}
                          >
                            망각률 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.forgettingRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('retentionIndex')}
                          >
                            보유 지수 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.retentionIndex.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('consistencyPercent')}
                          >
                            일관성 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.consistencyPercent.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('retrievalEfficiency')}
                          >
                            인출 효율성 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.retrievalEfficiency.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('recognitionEfficiency')}
                          >
                            재인 효율성 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.recognitionEfficiency}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 재인 분석 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">재인 분석 (신호탐지이론)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('dPrime')}
                          >
                            d' (변별력) <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.dPrime.toFixed(2)}</p>
                          <Badge variant={results.derived.dPrime < 1.5 ? "destructive" : "default"}>
                            {results.derived.dPrime < 1.5 ? "저하" : "정상"}
                          </Badge>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('beta')}
                          >
                            β (반응편향) <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.derived.beta.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">오경보</p>
                          <p className="text-xl font-semibold">{results.scores.recognition.falseAlarms}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">누락</p>
                          <p className="text-xl font-semibold">{results.scores.recognition.misses}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 오류 분석 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">오류 분석</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('intrusions')}
                          >
                            침입 오류 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.errors.intrusions}</p>
                          <Badge variant={results.errors.intrusions > 5 ? "destructive" : "default"}>
                            {results.errors.intrusions > 5 ? "증가" : "정상"}
                          </Badge>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('repetitions')}
                          >
                            반복 오류 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.errors.repetitions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">침입률</p>
                          <p className="text-xl font-semibold">{results.errors.intrusionRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">반복률</p>
                          <p className="text-xl font-semibold">{results.errors.repetitionRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 회상 순서 분석 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">회상 순서 분석</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p 
                              className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                              onClick={() => showScoreDescription('primacyEffect')}
                            >
                              초반 회상 (1-3번째) <Info className="h-3 w-3" />
                            </p>
                            <p className="text-xl font-semibold">{results.serialPosition.primacyEffect.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">중반 회상 (4-7번째)</p>
                            <p className="text-xl font-semibold">{results.serialPosition.middleRecall.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p 
                              className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                              onClick={() => showScoreDescription('recencyEffect')}
                            >
                              후반 회상 (8-10번째) <Info className="h-3 w-3" />
                            </p>
                            <p className="text-xl font-semibold">{results.serialPosition.recencyEffect.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('recallStrategy')}
                          >
                            회상 전략 <Info className="h-3 w-3" />
                          </p>
                          <Badge variant="outline" className="text-base">
                            {results.recallOrder.strategy}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 표준화 점수 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">표준화 점수</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 
                            className="font-semibold mb-2 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('zScore')}
                          >
                            Z 점수 <Info className="h-3 w-3" />
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">즉각 기억</p>
                              <p className="text-xl font-semibold">{results.standardScores.zScores.immediate.toFixed(2)}</p>
                              <Badge variant={results.standardScores.zScores.immediate < -1.5 ? "destructive" : "default"}>
                                {results.standardScores.zScores.immediate < -2 ? "심각" : 
                                 results.standardScores.zScores.immediate < -1.5 ? "중등도" :
                                 results.standardScores.zScores.immediate < -1 ? "경미" : "정상"}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">지연 기억</p>
                              <p className="text-xl font-semibold">{results.standardScores.zScores.delayed.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">재인</p>
                              <p className="text-xl font-semibold">{results.standardScores.zScores.recognition.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 
                            className="font-semibold mb-2 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('tScore')}
                          >
                            T 점수 <Info className="h-3 w-3" />
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">즉각 기억</p>
                              <p className="text-xl font-semibold">{results.standardScores.tScores.immediate.toFixed(0)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">지연 기억</p>
                              <p className="text-xl font-semibold">{results.standardScores.tScores.delayed.toFixed(0)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">재인</p>
                              <p className="text-xl font-semibold">{results.standardScores.tScores.recognition.toFixed(0)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 
                            className="font-semibold mb-2 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('percentile')}
                          >
                            백분위 <Info className="h-3 w-3" />
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">즉각 기억</p>
                              <p className="text-xl font-semibold">{results.standardScores.percentiles.immediate.toFixed(0)}%ile</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">지연 기억</p>
                              <p className="text-xl font-semibold">{results.standardScores.percentiles.delayed.toFixed(0)}%ile</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">재인</p>
                              <p className="text-xl font-semibold">{results.standardScores.percentiles.recognition.toFixed(0)}%ile</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 추가 지표 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">추가 분석 지표</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('firstTrialMemory')}
                          >
                            첫 시행 기억 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.additional.firstTrialMemory}/10</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('estimatedLTS')}
                          >
                            추정 장기저장 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.additional.estimatedLTS}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">학습 패턴</p>
                          <p className="text-xl font-semibold">{results.additional.learningPattern}</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('contrastScaledScore')}
                          >
                            대조 척도점수 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.additional.contrastScaledScore}</p>
                        </div>
                        <div>
                          <p 
                            className="text-sm text-gray-600 cursor-pointer hover:underline flex items-center gap-1"
                            onClick={() => showScoreDescription('cueingEffect')}
                          >
                            단서 효과 <Info className="h-3 w-3" />
                          </p>
                          <p className="text-xl font-semibold">{results.additional.cueingEffect}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 임상적 해석 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">임상적 해석</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {results.interpretation.map((interp, idx) => (
                          <Alert key={idx}>
                            <AlertDescription>{interp}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 인지 프로파일 요약 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">인지 프로파일 요약</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>부호화 vs 인출</span>
                          <Badge>
                            {results.derived.recognitionEfficiency > 3 ? "인출 결함 우세" : "부호화 결함 우세"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>학습 패턴</span>
                          <Badge>{results.additional.learningPattern}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>기억 보유</span>
                          <Badge variant={results.derived.savingsScore < 70 ? "destructive" : "default"}>
                            {results.derived.savingsScore < 50 ? "급속 망각" : 
                             results.derived.savingsScore < 70 ? "가속 망각" : "정상 보유"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>전두엽 기능</span>
                          <Badge variant={results.errors.intrusions > 5 ? "destructive" : "default"}>
                            {results.errors.intrusions > 5 ? "저하 의심" : "정상"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>회상 전략</span>
                          <Badge>{results.additional.recallStrategy}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    검사 입력 탭에서 모든 정보를 입력한 후 '결과 분석' 버튼을 클릭하세요.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* 점수 설명 팝업 */}
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{popupContent.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="whitespace-pre-line text-left">
            {popupContent.description}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CERADMemoryTest;