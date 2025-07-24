import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const VerbralLearningTestCalculator = () => {
  const [selectedTest, setSelectedTest] = useState('');
  const [testData, setTestData] = useState({});
  const [results, setResults] = useState(null);

  // 검사 목록
  const tests = {
    'CVLT-3': 'California Verbal Learning Test-3',
    'K-CVLT': 'Korean California Verbal Learning Test',
    'RAVLT': 'Rey Auditory Verbal Learning Test',
    'HVLT-R': 'Hopkins Verbal Learning Test-Revised',
    'SVLT': 'Seoul Verbal Learning Test',
    'CERAD': 'CERAD Word List Memory Test',
    'SRT': 'Selective Reminding Test',
    'FCSRT': 'Free and Cued Selective Reminding Test'
  };

  // 각 검사의 표준 단어 목록과 범주
  const testWordLists = {
    'CVLT-3': {
      listA: {
        words: ['drill', 'vest', 'peach', 'truck', 'plum', 'helmet', 'apple', 'bus', 
                'chisel', 'apricot', 'jacket', 'airplane', 'pliers', 'boots', 'tangerine', 'bicycle'],
        categories: {
          'drill': 'tools', 'vest': 'clothes', 'peach': 'fruits', 'truck': 'vehicles',
          'plum': 'fruits', 'helmet': 'clothes', 'apple': 'fruits', 'bus': 'vehicles',
          'chisel': 'tools', 'apricot': 'fruits', 'jacket': 'clothes', 'airplane': 'vehicles',
          'pliers': 'tools', 'boots': 'clothes', 'tangerine': 'fruits', 'bicycle': 'vehicles'
        }
      },
      listB: {
        words: ['shovel', 'orange', 'shirt', 'hammer', 'banana', 'coat', 'saw', 'strawberry'],
        categories: {}
      }
    },
    'K-CVLT': {
      listA: {
        words: ['사과', '망치', '바지', '버스', '포도', '톱', '셔츠', '자전거',
                '딸기', '드라이버', '양말', '기차', '오렌지', '못', '모자', '비행기'],
        categories: {
          '사과': '과일', '망치': '도구', '바지': '의류', '버스': '탈것',
          '포도': '과일', '톱': '도구', '셔츠': '의류', '자전거': '탈것',
          '딸기': '과일', '드라이버': '도구', '양말': '의류', '기차': '탈것',
          '오렌지': '과일', '못': '도구', '모자': '의류', '비행기': '탈것'
        }
      },
      listB: {
        words: ['의자', '침대', '책상', '소파', '탁자', '서랍장', '옷장', '책장'],
        categories: {}
      }
    },
    'RAVLT': {
      listA: {
        words: ['drum', 'curtain', 'bell', 'coffee', 'school', 'parent', 'moon', 'garden',
                'hat', 'farmer', 'nose', 'turkey', 'color', 'house', 'river'],
        categories: {} // RAVLT는 범주가 없음
      },
      listB: {
        words: ['desk', 'ranger', 'bird', 'shoe', 'stove', 'mountain', 'glasses', 'towel',
                'cloud', 'boat', 'lamb', 'gun', 'pencil', 'church', 'fish'],
        categories: {}
      }
    },
    'HVLT-R': {
      form1: {
        words: ['emerald', 'horse', 'cabin', 'sapphire', 'cave', 'cow', 'pearl', 'tent',
                'tiger', 'ruby', 'hotel', 'lion'],
        categories: {
          'emerald': 'stones', 'horse': 'animals', 'cabin': 'dwellings', 'sapphire': 'stones',
          'cave': 'dwellings', 'cow': 'animals', 'pearl': 'stones', 'tent': 'dwellings',
          'tiger': 'animals', 'ruby': 'stones', 'hotel': 'dwellings', 'lion': 'animals'
        }
      }
    },
    'SVLT': {
      listA: {
        words: ['장미', '소파', '호랑이', '국화', '책상', '사자', '백합', '의자',
                '코끼리', '튤립', '침대', '기린'],
        categories: {
          '장미': '꽃', '소파': '가구', '호랑이': '동물', '국화': '꽃',
          '책상': '가구', '사자': '동물', '백합': '꽃', '의자': '가구',
          '코끼리': '동물', '튤립': '꽃', '침대': '가구', '기린': '동물'
        }
      },
      listB: {
        words: ['자동차', '버스', '기차', '배', '비행기', '자전거'],
        categories: {}
      }
    },
    'CERAD': {
      words: ['butter', 'arm', 'shore', 'letter', 'queen', 'cabin', 'pole', 'ticket', 'grass', 'engine'],
      categories: {} // CERAD는 범주가 없음
    },
    'FCSRT': {
      words: ['grapes', 'vest', 'horse', 'desk', 'strawberry', 'coat', 'lion', 'chair',
              'orange', 'pants', 'cow', 'bed', 'apple', 'shirt', 'cat', 'sofa'],
      categories: {
        'grapes': 'fruit', 'vest': 'clothing', 'horse': 'animal', 'desk': 'furniture',
        'strawberry': 'fruit', 'coat': 'clothing', 'lion': 'animal', 'chair': 'furniture',
        'orange': 'fruit', 'pants': 'clothing', 'cow': 'animal', 'bed': 'furniture',
        'apple': 'fruit', 'shirt': 'clothing', 'cat': 'animal', 'sofa': 'furniture'
      }
    }
  };

  // 입력 데이터 초기화
  const initializeTestData = (test) => {
    const baseData = {
      age: '',
      education: '',
      gender: ''
    };

    const wordInputData = {
      // 각 시행별 회상 단어 배열
      trial1Words: [], trial2Words: [], trial3Words: [], 
      trial4Words: [], trial5Words: [], trial6Words: [],
      listBWords: [],
      shortDelayWords: [], longDelayWords: [],
      delayedWords: [],
      // 단어별 체크박스 상태
      wordChecks: {}
    };

    switch(test) {
      case 'CVLT-3':
      case 'K-CVLT':
        return {
          ...baseData,
          ...wordInputData,
          recognitionResponses: {}, // 재인 반응
          intrusions: [],
          repetitions: []
        };
      
      case 'RAVLT':
        return {
          ...baseData,
          ...wordInputData,
          a6Words: [], a7Words: [],
          recognitionResponses: {}
        };
      
      case 'HVLT-R':
        return {
          ...baseData,
          trial1Words: [], trial2Words: [], trial3Words: [],
          delayedWords: [],
          recognitionResponses: {}
        };
      
      case 'SVLT':
        return {
          ...baseData,
          ...wordInputData,
          a6Words: [], a7Words: [],
          recognitionResponses: {}
        };
      
      case 'CERAD':
        return {
          ...baseData,
          trial1Words: [], trial2Words: [], trial3Words: [],
          delayedWords: [],
          recognitionResponses: {}
        };
      
      case 'SRT':
        return {
          ...baseData,
          ...wordInputData,
          remindedWords: {} // 각 시행별 재제시 단어
        };
      
      case 'FCSRT':
        return {
          ...baseData,
          fr1Words: [], fr2Words: [], fr3Words: [],
          cr1Words: [], cr2Words: [], cr3Words: [],
          delayedFreeWords: [], delayedCuedWords: [],
          recognitionResponses: {}
        };
      
      default:
        return baseData;
    }
  };

  // 단어 선택 토글
  const toggleWord = (trial, word) => {
    setTestData(prev => {
      const trialWords = [...(prev[`${trial}Words`] || [])];
      const index = trialWords.indexOf(word);
      
      if (index > -1) {
        trialWords.splice(index, 1);
      } else {
        trialWords.push(word);
      }
      
      return {
        ...prev,
        [`${trial}Words`]: trialWords
      };
    });
  };

  // 의미적 군집 계산 (점수와 군집 수 모두 반환)
  const calculateSemanticClustering = (words, categories) => {
    if (!words || words.length < 2 || !categories) return { score: 0, clusters: 0 };
    
    let score = 0;
    let clusters = 0;
    let consecutive = 1;
    
    for (let i = 1; i < words.length; i++) {
      const prevCategory = categories[words[i-1]];
      const currCategory = categories[words[i]];
      
      if (prevCategory && currCategory && prevCategory === currCategory) {
        consecutive++;
      } else {
        if (consecutive >= 2) {
          score += (consecutive - 1);
          clusters++;
        }
        consecutive = 1;
      }
    }
    
    if (consecutive >= 2) {
      score += (consecutive - 1);
      clusters++;
    }
    
    return { score, clusters };
  };

  // 계열적 군집 계산 (점수와 군집 수 모두 반환)
  const calculateSerialClustering = (recalledWords, originalOrder) => {
    if (!recalledWords || recalledWords.length < 2) return { score: 0, clusters: 0 };
    
    let score = 0;
    let clusters = 0;
    let consecutive = 1;
    
    for (let i = 1; i < recalledWords.length; i++) {
      const prevIndex = originalOrder.indexOf(recalledWords[i-1]);
      const currIndex = originalOrder.indexOf(recalledWords[i]);
      
      if (prevIndex !== -1 && currIndex !== -1 && currIndex === prevIndex + 1) {
        consecutive++;
      } else {
        if (consecutive >= 2) {
          score += (consecutive - 1);
          clusters++;
        }
        consecutive = 1;
      }
    }
    
    if (consecutive >= 2) {
      score += (consecutive - 1);
      clusters++;
    }
    
    return { score, clusters };
  };

  // 학습 일관성 계산
  const calculateConsistency = (trials) => {
    const validTrials = trials.filter(t => t && t.length > 0);
    if (validTrials.length < 2) return 0;
    
    let sharedWords = 0;
    let totalWords = 0;
    
    for (let i = 0; i < validTrials.length - 1; i++) {
      const current = new Set(validTrials[i]);
      const next = new Set(validTrials[i + 1]);
      
      const shared = [...current].filter(word => next.has(word)).length;
      sharedWords += shared;
      totalWords += current.size;
    }
    
    return totalWords > 0 ? (sharedWords / totalWords * 100) : 0;
  };

  // 침입 오류 감지
  const detectIntrusions = (recalledWords, validWords) => {
    const validSet = new Set(validWords);
    return recalledWords.filter(word => !validSet.has(word));
  };

  // 반복 오류 감지
  const detectRepetitions = (recalledWords) => {
    const seen = new Set();
    const repetitions = [];
    
    recalledWords.forEach(word => {
      if (seen.has(word)) {
        repetitions.push(word);
      }
      seen.add(word);
    });
    
    return repetitions;
  };

  // CVLT-3 연령별 규준 (예시 데이터)
  const cvltNorms = {
    '16-29': {
      trial1: { mean: 7.5, sd: 2.1 },
      trial5: { mean: 13.8, sd: 1.9 },
      totalLearning: { mean: 54.2, sd: 8.3 },
      delayedFree: { mean: 12.1, sd: 2.5 },
      delayedCued: { mean: 13.2, sd: 2.1 },
      recognition: { mean: 15.3, sd: 0.9 }
    },
    '30-44': {
      trial1: { mean: 6.9, sd: 2.0 },
      trial5: { mean: 12.9, sd: 2.1 },
      totalLearning: { mean: 50.8, sd: 8.9 },
      delayedFree: { mean: 11.2, sd: 2.8 },
      delayedCued: { mean: 12.4, sd: 2.3 },
      recognition: { mean: 15.1, sd: 1.0 }
    },
    '45-59': {
      trial1: { mean: 6.3, sd: 1.9 },
      trial5: { mean: 11.8, sd: 2.3 },
      totalLearning: { mean: 46.5, sd: 9.2 },
      delayedFree: { mean: 10.1, sd: 3.0 },
      delayedCued: { mean: 11.3, sd: 2.6 },
      recognition: { mean: 14.8, sd: 1.2 }
    },
    '60-89': {
      trial1: { mean: 5.2, sd: 1.8 },
      trial5: { mean: 9.8, sd: 2.5 },
      totalLearning: { mean: 38.4, sd: 9.8 },
      delayedFree: { mean: 7.9, sd: 3.2 },
      delayedCued: { mean: 9.1, sd: 3.0 },
      recognition: { mean: 14.2, sd: 1.5 }
    }
  };

  // T점수 변환 함수
  const calculateTScore = (rawScore, mean, sd) => {
    if (!mean || !sd || sd === 0) return null;
    return Math.round(50 + 10 * ((rawScore - mean) / sd));
  };

  // 연령대 결정 함수
  const getAgeGroup = (age) => {
    const ageNum = parseInt(age);
    if (ageNum >= 16 && ageNum <= 29) return '16-29';
    if (ageNum >= 30 && ageNum <= 44) return '30-44';
    if (ageNum >= 45 && ageNum <= 59) return '45-59';
    if (ageNum >= 60 && ageNum <= 89) return '60-89';
    return null;
  };

  // 계열 위치 효과 계산
  const calculateSerialPositionEffect = (trials, originalWords) => {
    const positions = originalWords.length;
    const recallByPosition = new Array(positions).fill(0);
    const totalTrials = trials.filter(t => t && t.length > 0).length;
    
    trials.forEach(trial => {
      if (trial && trial.length > 0) {
        trial.forEach(word => {
          const position = originalWords.indexOf(word);
          if (position !== -1) {
            recallByPosition[position]++;
          }
        });
      }
    });
    
    // 초두, 중간, 최신 효과 계산
    const primacyPositions = Math.floor(positions / 3);
    const recencyPositions = Math.floor(positions / 3);
    const middleStart = primacyPositions;
    const middleEnd = positions - recencyPositions;
    
    const primacy = recallByPosition.slice(0, primacyPositions).reduce((a, b) => a + b, 0) / (primacyPositions * totalTrials);
    const middle = recallByPosition.slice(middleStart, middleEnd).reduce((a, b) => a + b, 0) / ((middleEnd - middleStart) * totalTrials);
    const recency = recallByPosition.slice(-recencyPositions).reduce((a, b) => a + b, 0) / (recencyPositions * totalTrials);
    
    return { primacy, middle, recency, recallByPosition };
  };

  // 결과 계산
  const calculateResults = () => {
    const baseResults = {
      검사명: tests[selectedTest],
      연령: testData.age,
      교육년수: testData.education,
      성별: testData.gender
    };

    let specificResults = {};
    let wordList, categories;

    switch(selectedTest) {
      case 'CVLT-3':
      case 'K-CVLT':
        wordList = testWordLists[selectedTest].listA;
        categories = wordList.categories;
        
        const trials = [
          testData.trial1Words, testData.trial2Words, testData.trial3Words,
          testData.trial4Words, testData.trial5Words
        ];
        
        // 기본 점수
        const trial1Score = testData.trial1Words?.length || 0;
        const trial5Score = testData.trial5Words?.length || 0;
        const totalLearning = trials.reduce((sum, trial) => sum + (trial?.length || 0), 0);
        const learningSlope = trial5Score - trial1Score;
        
        // 지연 회상 점수
        const shortDelayFree = testData.shortDelayWords?.length || 0;
        const longDelayFree = testData.longDelayWords?.length || 0;
        // 단서 회상은 별도 입력 필요 (추후 구현)
        const longDelayCued = longDelayFree + 2; // 임시값
        
        // 간섭 효과
        const proactiveInterference = trial1Score ? 
          ((testData.listBWords?.length || 0) / trial1Score * 100) : 0;
        const retroactiveInterference = trial5Score ? 
          (shortDelayFree / trial5Score * 100) : 0;
        
        // 보유율
        const shortRetention = trial5Score ? (shortDelayFree / trial5Score * 100) : 0;
        const longRetention = trial5Score ? (longDelayFree / trial5Score * 100) : 0;
        
        // 단서 효과
        const cueingBenefit = longDelayCued - longDelayFree;
        
        // 군집 분석 (개선된 버전)
        const semanticResults = trials.map(trial => 
          calculateSemanticClustering(trial, categories)
        );
        const serialResults = trials.map(trial => 
          calculateSerialClustering(trial, wordList.words)
        );
        
        const totalSemanticClusters = semanticResults.reduce((sum, r) => sum + r.clusters, 0);
        const totalSerialClusters = serialResults.reduce((sum, r) => sum + r.clusters, 0);
        const semanticClusterRatio = totalLearning ? (totalSemanticClusters / totalLearning * 100) : 0;
        const serialClusterRatio = totalLearning ? (totalSerialClusters / totalLearning * 100) : 0;
        
        // 일관성
        const consistency = calculateConsistency(trials);
        
        // 오류 분석 (개선)
        let allIntrusions = [];
        let listBIntrusions = 0;
        let totalRepetitions = 0;
        
        trials.forEach((trial, index) => {
          if (trial && trial.length > 0) {
            // 침입 오류
            const intrusions = detectIntrusions(trial, wordList.words);
            allIntrusions = [...allIntrusions, ...intrusions];
            
            // List B 침입 (시행 2-5와 지연회상에서만)
            if (index > 0 && testData.listBWords) {
              const listBWords = testWordLists[selectedTest].listB.words;
              const bIntrusions = trial.filter(word => listBWords.includes(word));
              listBIntrusions += bIntrusions.length;
            }
            
            // 반복 오류
            const repetitions = detectRepetitions(trial);
            totalRepetitions += repetitions.length;
          }
        });
        
        // 계열 위치 효과
        const serialPosition = calculateSerialPositionEffect(trials, wordList.words);
        
        // T점수 계산 (연령별 규준 필요)
        const ageGroup = getAgeGroup(testData.age);
        let tScores = {};
        
        if (ageGroup && cvltNorms[ageGroup]) {
          const norms = cvltNorms[ageGroup];
          tScores = {
            trial1T: calculateTScore(trial1Score, norms.trial1.mean, norms.trial1.sd),
            trial5T: calculateTScore(trial5Score, norms.trial5.mean, norms.trial5.sd),
            totalLearningT: calculateTScore(totalLearning, norms.totalLearning.mean, norms.totalLearning.sd),
            delayedFreeT: calculateTScore(longDelayFree, norms.delayedFree.mean, norms.delayedFree.sd),
            delayedCuedT: calculateTScore(longDelayCued, norms.delayedCued.mean, norms.delayedCued.sd),
          };
        }
        
        // 학습/기억 지수 계산
        const immediateMemoryIndex = tScores.totalLearningT || 'N/A';
        const delayedMemoryIndex = (tScores.delayedFreeT && tScores.delayedCuedT) ? 
          Math.round((tScores.delayedFreeT + tScores.delayedCuedT) / 2) : 'N/A';
        
        specificResults = {
          '즉각 회상': {
            '1차 시행': `${trial1Score}/16`,
            '2차 시행': `${testData.trial2Words?.length || 0}/16`,
            '3차 시행': `${testData.trial3Words?.length || 0}/16`,
            '4차 시행': `${testData.trial4Words?.length || 0}/16`,
            '5차 시행': `${trial5Score}/16`,
            '총 학습량': `${totalLearning}/80`,
            '학습 기울기': learningSlope,
            '학습률': trial1Score ? `${(learningSlope / trial1Score * 100).toFixed(1)}%` : '0%'
          },
          '간섭 효과': {
            'List B 회상': `${testData.listBWords?.length || 0}/8`,
            '전향 간섭': `${proactiveInterference.toFixed(1)}%`,
            '후향 간섭': `${retroactiveInterference.toFixed(1)}%`
          },
          '지연 회상': {
            '단기 지연 자유회상': `${shortDelayFree}/16`,
            '장기 지연 자유회상': `${longDelayFree}/16`,
            '장기 지연 단서회상': `${longDelayCued}/16`,
            '단기 보유율': `${shortRetention.toFixed(1)}%`,
            '장기 보유율': `${longRetention.toFixed(1)}%`,
            '보유율 해석': longRetention < 70 ? '급속 망각 의심' : '정상 범위',
            '단서 이득': cueingBenefit,
            '단서 효과 해석': cueingBenefit > 3 ? '인출 결함 시사' : '정상'
          },
          '학습 특성': {
            '의미적 군집 수': totalSemanticClusters,
            '의미적 군집 비율': `${semanticClusterRatio.toFixed(1)}%`,
            '계열적 군집 수': totalSerialClusters,
            '계열적 군집 비율': `${serialClusterRatio.toFixed(1)}%`,
            '의미적 > 계열적': totalSemanticClusters > totalSerialClusters ? '예 (효율적)' : '아니오',
            '학습 일관성': `${consistency.toFixed(1)}%`
          },
          '오류 분석': {
            '침입 오류 수': allIntrusions.length,
            '침입 단어': allIntrusions.join(', ') || '없음',
            'List B 침입': listBIntrusions,
            '반복 오류 수': totalRepetitions
          },
          '계열 위치 효과': {
            '초두 효과': `${(serialPosition.primacy * 100).toFixed(1)}%`,
            '중간 효과': `${(serialPosition.middle * 100).toFixed(1)}%`,
            '최신 효과': `${(serialPosition.recency * 100).toFixed(1)}%`
          },
          'T점수 (연령 보정)': {
            '1차 시행 T점수': tScores.trial1T || 'N/A',
            '5차 시행 T점수': tScores.trial5T || 'N/A',
            '총 학습 T점수': tScores.totalLearningT || 'N/A',
            '지연 자유회상 T점수': tScores.delayedFreeT || 'N/A',
            '지연 단서회상 T점수': tScores.delayedCuedT || 'N/A'
          },
          '학습/기억 지수': {
            '즉각 기억 지수': immediateMemoryIndex,
            '지연 기억 지수': delayedMemoryIndex,
            '재인 기억 지수': 'N/A (재인 데이터 필요)'
          }
        };
        break;

      case 'RAVLT':
        wordList = testWordLists.RAVLT.listA;
        
        const ravltTrials = [
          testData.trial1Words, testData.trial2Words, testData.trial3Words,
          testData.trial4Words, testData.trial5Words
        ];
        
        const ravltTotal = ravltTrials.reduce((sum, trial) => sum + (trial?.length || 0), 0);
        const ravltSlope = (testData.trial5Words?.length || 0) - (testData.trial1Words?.length || 0);
        
        // 간섭
        const ravltPI = testData.trial1Words?.length ? 
          ((testData.listBWords?.length || 0) / testData.trial1Words.length * 100) : 0;
        const ravltRI = testData.trial5Words?.length ? 
          ((testData.a6Words?.length || 0) / testData.trial5Words.length * 100) : 0;
        
        // 망각
        const forgettingRate = testData.trial5Words?.length ? 
          (((testData.trial5Words.length - (testData.a7Words?.length || 0)) / testData.trial5Words.length) * 100) : 0;
        
        // 일관성
        const ravltConsistency = calculateConsistency(ravltTrials);
        
        // 계열 위치
        const ravltSerialPosition = calculateSerialPositionEffect(ravltTrials, wordList.words);
        
        specificResults = {
          '학습 단계': {
            'A1': testData.trial1Words?.length || 0,
            'A2': testData.trial2Words?.length || 0,
            'A3': testData.trial3Words?.length || 0,
            'A4': testData.trial4Words?.length || 0,
            'A5': testData.trial5Words?.length || 0,
            '총점': ravltTotal,
            '학습 기울기': ravltSlope
          },
          '간섭 효과': {
            'B 목록': testData.listBWords?.length || 0,
            '전향 간섭': ravltPI.toFixed(1) + '%',
            'A6 (간섭 후)': testData.a6Words?.length || 0,
            '후향 간섭': ravltRI.toFixed(1) + '%'
          },
          '지연 회상': {
            'A7 (20분 지연)': testData.a7Words?.length || 0,
            '망각률': forgettingRate.toFixed(1) + '%',
            '보유율': (100 - forgettingRate).toFixed(1) + '%'
          },
          '학습 특성': {
            '학습 일관성': ravltConsistency.toFixed(1) + '%',
            '초두 효과': (ravltSerialPosition.primacy * 100).toFixed(1) + '%',
            '중간 효과': (ravltSerialPosition.middle * 100).toFixed(1) + '%',
            '최신 효과': (ravltSerialPosition.recency * 100).toFixed(1) + '%'
          }
        };
        break;

      case 'HVLT-R':
        wordList = testWordLists['HVLT-R'].form1;
        categories = wordList.categories;
        
        const hvltTrials = [testData.trial1Words, testData.trial2Words, testData.trial3Words];
        const hvltTotal = hvltTrials.reduce((sum, trial) => sum + (trial?.length || 0), 0);
        const hvltBest = Math.max(...hvltTrials.map(t => t?.length || 0));
        const hvltRetention = hvltBest ? ((testData.delayedWords?.length || 0) / hvltBest * 100) : 0;
        
        // 군집 분석
        const hvltSemanticScores = hvltTrials.map(trial => 
          calculateSemanticClustering(trial, categories)
        );
        
        specificResults = {
          '즉각 회상': {
            '시행 1': testData.trial1Words?.length || 0,
            '시행 2': testData.trial2Words?.length || 0,
            '시행 3': testData.trial3Words?.length || 0,
            '총 회상': hvltTotal,
            '최고 학습': hvltBest,
            '학습 곡선': (testData.trial3Words?.length || 0) - (testData.trial1Words?.length || 0)
          },
          '지연 회상': {
            '지연 회상': testData.delayedWords?.length || 0,
            '보유율': hvltRetention.toFixed(1) + '%',
            '회상 단어': testData.delayedWords?.join(', ') || '없음'
          },
          '질적 분석': {
            '의미적 군집 총점': hvltSemanticScores.reduce((a, b) => a + b, 0),
            '학습 일관성': calculateConsistency(hvltTrials).toFixed(1) + '%'
          }
        };
        break;

      case 'CERAD':
        wordList = { words: testWordLists.CERAD.words };
        
        const ceradTrials = [testData.trial1Words, testData.trial2Words, testData.trial3Words];
        const ceradTotal = ceradTrials.reduce((sum, trial) => sum + (trial?.length || 0), 0);
        const ceradBest = Math.max(...ceradTrials.map(t => t?.length || 0));
        const savingsScore = ceradBest ? ((testData.delayedWords?.length || 0) / ceradBest * 100) : 0;
        
        // 추가 분석
        const ceradConsistency = calculateConsistency(ceradTrials);
        const ceradSerialPosition = calculateSerialPositionEffect(ceradTrials, wordList.words);
        
        specificResults = {
          '즉각 회상': {
            '시행 1': testData.trial1Words?.length || 0,
            '시행 2': testData.trial2Words?.length || 0,
            '시행 3': testData.trial3Words?.length || 0,
            '총점': ceradTotal,
            '학습': (testData.trial3Words?.length || 0) - (testData.trial1Words?.length || 0)
          },
          '지연 회상': {
            '지연 회상': testData.delayedWords?.length || 0,
            '절약 점수': savingsScore.toFixed(1) + '%',
            '절약 해석': savingsScore > 90 ? '우수한 고착' : 
                        savingsScore > 70 ? '정상 고착' : 
                        savingsScore > 50 ? '경미한 망각' : '가속 망각'
          },
          '추가 분석': {
            '학습률': testData.trial1Words?.length ? 
              (((testData.trial3Words?.length || 0) - testData.trial1Words.length) / testData.trial1Words.length * 100).toFixed(1) + '%' : '0%',
            '학습 일관성': ceradConsistency.toFixed(1) + '%',
            '초두 효과': (ceradSerialPosition.primacy * 100).toFixed(1) + '%',
            '최신 효과': (ceradSerialPosition.recency * 100).toFixed(1) + '%'
          }
        };
        break;

      case 'FCSRT':
        wordList = { words: testWordLists.FCSRT.words };
        categories = testWordLists.FCSRT.categories;
        
        const frTrials = [testData.fr1Words, testData.fr2Words, testData.fr3Words];
        const crTrials = [testData.cr1Words, testData.cr2Words, testData.cr3Words];
        
        const totalFree = frTrials.reduce((sum, trial) => sum + (trial?.length || 0), 0);
        const totalCued = crTrials.reduce((sum, trial) => sum + (trial?.length || 0), 0);
        const totalRecall = totalFree + totalCued;
        
        const encodingSpecificity = (totalRecall / 48 * 100);
        const cuingBenefit = totalFree ? ((totalRecall - totalFree) / totalFree * 100) : 0;
        
        specificResults = {
          '즉각 회상': {
            '자유회상 1': testData.fr1Words?.length || 0,
            '자유회상 2': testData.fr2Words?.length || 0,
            '자유회상 3': testData.fr3Words?.length || 0,
            '총 자유회상': totalFree,
            '총 단서회상': totalCued,
            '총 회상': totalRecall + '/48'
          },
          '지연 회상': {
            '지연 자유회상': testData.delayedFreeWords?.length || 0,
            '지연 단서회상': testData.delayedCuedWords?.length || 0,
            '지연 총 회상': (testData.delayedFreeWords?.length || 0) + (testData.delayedCuedWords?.length || 0)
          },
          '민감도 지표': {
            '부호화 특이성 지수': encodingSpecificity.toFixed(1) + '%',
            '단서 효과': cuingBenefit.toFixed(1) + '%',
            '보유율': ((testData.delayedFreeWords?.length || 0) + (testData.delayedCuedWords?.length || 0)) / 16 * 100 + '%'
          },
          '진단 해석': {
            'MCI 가능성': totalFree <= 27 ? '높음' : '낮음',
            'AD 가능성': totalFree <= 17 ? '매우 높음' : totalRecall <= 40 ? '높음' : '낮음'
          }
        };
        break;
    }

    setResults({
      ...baseResults,
      ...specificResults
    });
  };

  // 단어 체크박스 그리드 렌더링
  const renderWordGrid = (wordList, trial, columns = 4) => {
    const words = wordList.words || wordList;
    const checkedWords = testData[`${trial}Words`] || [];
    
    return (
      <div className={`grid grid-cols-${columns} gap-2 p-3 border rounded bg-gray-50`}>
        {words.map((word, index) => (
          <label key={index} className="flex items-center space-x-1 text-sm">
            <input
              type="checkbox"
              checked={checkedWords.includes(word)}
              onChange={() => toggleWord(trial, word)}
              className="w-4 h-4"
            />
            <span>{word}</span>
          </label>
        ))}
      </div>
    );
  };

  // 입력 폼 렌더링
  const renderInputForm = () => {
    if (!selectedTest) return null;

    const commonFields = (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">연령</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={testData.age}
            onChange={(e) => setTestData(prev => ({ ...prev, age: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">교육년수</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={testData.education}
            onChange={(e) => setTestData(prev => ({ ...prev, education: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">성별</label>
          <select
            className="w-full p-2 border rounded"
            value={testData.gender}
            onChange={(e) => setTestData(prev => ({ ...prev, gender: e.target.value }))}
          >
            <option value="">선택</option>
            <option value="M">남</option>
            <option value="F">여</option>
          </select>
        </div>
      </div>
    );

    switch(selectedTest) {
      case 'CVLT-3':
      case 'K-CVLT':
        const cvltWords = testWordLists[selectedTest];
        return (
          <div>
            {commonFields}
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">List A 학습 시행</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(trial => (
                  <div key={trial}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">시행 {trial}</label>
                      <span className="text-sm text-gray-600">
                        선택: {testData[`trial${trial}Words`]?.length || 0}/16
                      </span>
                    </div>
                    {renderWordGrid(cvltWords.listA, `trial${trial}`)}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">간섭 목록 (List B)</h3>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">List B</label>
                <span className="text-sm text-gray-600">
                  선택: {testData.listBWords?.length || 0}/8
                </span>
              </div>
              {renderWordGrid(cvltWords.listB, 'listB', 4)}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3">단기 지연 회상</h3>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">자유 회상</label>
                  <span className="text-sm text-gray-600">
                    선택: {testData.shortDelayWords?.length || 0}/16
                  </span>
                </div>
                {renderWordGrid(cvltWords.listA, 'shortDelay')}
              </div>

              <div>
                <h3 className="font-semibold mb-3">장기 지연 회상</h3>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">자유 회상</label>
                  <span className="text-sm text-gray-600">
                    선택: {testData.longDelayWords?.length || 0}/16
                  </span>
                </div>
                {renderWordGrid(cvltWords.listA, 'longDelay')}
              </div>
            </div>
          </div>
        );

      case 'RAVLT':
        const ravltWords = testWordLists.RAVLT;
        return (
          <div>
            {commonFields}
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">List A 학습 시행</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(trial => (
                  <div key={trial}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">A{trial}</label>
                      <span className="text-sm text-gray-600">
                        선택: {testData[`trial${trial}Words`]?.length || 0}/15
                      </span>
                    </div>
                    {renderWordGrid(ravltWords.listA, `trial${trial}`, 5)}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">간섭 목록 (List B)</h3>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">B1</label>
                <span className="text-sm text-gray-600">
                  선택: {testData.listBWords?.length || 0}/15
                </span>
              </div>
              {renderWordGrid(ravltWords.listB, 'listB', 5)}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">간섭 후 회상</h3>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">A6</label>
                  <span className="text-sm text-gray-600">
                    선택: {testData.a6Words?.length || 0}/15
                  </span>
                </div>
                {renderWordGrid(ravltWords.listA, 'a6', 5)}
              </div>

              <div>
                <h3 className="font-semibold mb-3">20분 지연 회상</h3>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">A7</label>
                  <span className="text-sm text-gray-600">
                    선택: {testData.a7Words?.length || 0}/15
                  </span>
                </div>
                {renderWordGrid(ravltWords.listA, 'a7', 5)}
              </div>
            </div>
          </div>
        );

      case 'HVLT-R':
        const hvltWords = testWordLists['HVLT-R'].form1;
        return (
          <div>
            {commonFields}
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">즉각 회상 시행</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(trial => (
                  <div key={trial}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">시행 {trial}</label>
                      <span className="text-sm text-gray-600">
                        선택: {testData[`trial${trial}Words`]?.length || 0}/12
                      </span>
                    </div>
                    {renderWordGrid(hvltWords, `trial${trial}`, 4)}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">지연 회상 (20-25분)</h3>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">지연 회상</label>
                <span className="text-sm text-gray-600">
                  선택: {testData.delayedWords?.length || 0}/12
                </span>
              </div>
              {renderWordGrid(hvltWords, 'delayed', 4)}
            </div>
          </div>
        );

      case 'CERAD':
        const ceradWords = testWordLists.CERAD;
        return (
          <div>
            {commonFields}
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">즉각 회상 시행</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(trial => (
                  <div key={trial}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">시행 {trial}</label>
                      <span className="text-sm text-gray-600">
                        선택: {testData[`trial${trial}Words`]?.length || 0}/10
                      </span>
                    </div>
                    {renderWordGrid({ words: ceradWords.words }, `trial${trial}`, 5)}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">지연 회상 (5-10분)</h3>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">지연 회상</label>
                <span className="text-sm text-gray-600">
                  선택: {testData.delayedWords?.length || 0}/10
                </span>
              </div>
              {renderWordGrid({ words: ceradWords.words }, 'delayed', 5)}
            </div>
          </div>
        );

      case 'FCSRT':
        const fcsrtWords = testWordLists.FCSRT;
        return (
          <div>
            {commonFields}
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">즉각 회상 시행</h3>
              <div className="space-y-6">
                {[1, 2, 3].map(trial => (
                  <div key={trial} className="border p-4 rounded">
                    <h4 className="font-medium mb-3">시행 {trial}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">자유 회상</label>
                          <span className="text-sm text-gray-600">
                            선택: {testData[`fr${trial}Words`]?.length || 0}/16
                          </span>
                        </div>
                        {renderWordGrid({ words: fcsrtWords.words }, `fr${trial}`, 4)}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">단서 회상</label>
                          <span className="text-sm text-gray-600">
                            선택: {testData[`cr${trial}Words`]?.length || 0}/16
                          </span>
                        </div>
                        {renderWordGrid({ words: fcsrtWords.words }, `cr${trial}`, 4)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">지연 자유회상 (30분)</h3>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">자유 회상</label>
                  <span className="text-sm text-gray-600">
                    선택: {testData.delayedFreeWords?.length || 0}/16
                  </span>
                </div>
                {renderWordGrid({ words: fcsrtWords.words }, 'delayedFree', 4)}
              </div>

              <div>
                <h3 className="font-semibold mb-3">지연 단서회상</h3>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">단서 회상</label>
                  <span className="text-sm text-gray-600">
                    선택: {testData.delayedCuedWords?.length || 0}/16
                  </span>
                </div>
                {renderWordGrid({ words: fcsrtWords.words }, 'delayedCued', 4)}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 결과 표시
  const renderResults = () => {
    if (!results) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>분석 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <span className="font-semibold">검사:</span> {results.검사명}
              </div>
              <div>
                <span className="font-semibold">연령:</span> {results.연령}세
              </div>
              <div>
                <span className="font-semibold">교육:</span> {results.교육년수}년
              </div>
            </div>

            {Object.entries(results).map(([category, values]) => {
              if (['검사명', '연령', '교육년수', '성별'].includes(category)) return null;
              
              return (
                <div key={category} className="border rounded p-4">
                  <h3 className="font-semibold text-lg mb-3">{category}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(values).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // 검사 변경 시 데이터 초기화
  useEffect(() => {
    if (selectedTest) {
      setTestData(initializeTestData(selectedTest));
      setResults(null);
    }
  }, [selectedTest]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>언어 학습 검사 통합 분석 프로그램</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">검사 선택</label>
            <select
              className="w-full p-3 border rounded-lg text-lg"
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
            >
              <option value="">검사를 선택하세요</option>
              {Object.entries(tests).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          {renderInputForm()}

          {selectedTest && (
            <button
              onClick={calculateResults}
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors mt-6"
            >
              결과 분석
            </button>
          )}
        </CardContent>
      </Card>

      {renderResults()}
    </div>
  );
};

export default VerbralLearningTestCalculator;