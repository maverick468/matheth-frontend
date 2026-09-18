// frontend/src/components/game/GestureDetector.jsx
import React, { useEffect, useRef, useState } from 'react';
// ❌ REMOVE THIS LINE: import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Trophy, Timer, Hand, ArrowRight, RotateCcw, ArrowLeft, Play, Sparkles, Lightbulb } from 'lucide-react';
import AnswerChoices from './AnswerChoices';
import { GameTrack } from './GameTrack';
// Outcome thresholds, out of a 10-question level:
//   0 wrong          -> 'perfect'
//   1-4 wrong        -> 'partial'  (6-9 correct)
//   5+ wrong (MAX)   -> 'eaten'
const MAX_MISTAKES = 5;

// How long to pause on a wrong answer before advancing, depending on
// whether there's an explanation to show. A plain wrong answer keeps the
// snappy 1200ms pause; a wrong answer WITH an explanation gets extra time
// so the player can actually read it before the card swaps out.
const ADVANCE_DELAY_DEFAULT = 1200;
const ADVANCE_DELAY_WITH_EXPLANATION = 4200;

export const GestureDetector = ({
  questions = [],
  timerOption = 'None',
  onComplete,
  onBackToLevels,
  onNextLevel,
  hasNextLevel = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [displayQuestion, setDisplayQuestion] = useState(questions[0] || null);
  const [cardPhase, setCardPhase] = useState('in'); // 'in' | 'out'

  // Single source of truth for the end state -> null | 'eaten' | 'perfect' | 'partial'
  const [outcome, setOutcome] = useState(null);

  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(1);

  const [gestureStatus, setGestureStatus] = useState('Initializing Vision AI...');
  const [selectedOption, setSelectedOption] = useState(null);
  const [lockedAnswer, setLockedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [explanationText, setExplanationText] = useState(null); // NEW: wrong-answer explanation, if provided by the question data
  const [confirmProgress, setConfirmProgress] = useState(0);
  const [lastScoreChange, setLastScoreChange] = useState(null);
  const [canDetectGesture, setCanDetectGesture] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [detectedFingers, setDetectedFingers] = useState(0);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [selectHandActive, setSelectHandActive] = useState(false);
  const [confirmHandActive, setConfirmHandActive] = useState(false);
  const [readyBarFull, setReadyBarFull] = useState(false);

  const secondsLimit = timerOption === '15s' ? 15 : timerOption === '30s' ? 30 : timerOption === '60s' ? 60 : null;
  const [timeLeft, setTimeLeft] = useState(secondsLimit);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const currentQuestion = questions[currentIndex];

  const confirmHoldRef = useRef(0);
  const selectedOptionRef = useRef(null);
  const lastProcessedTimeRef = useRef(0);
  const prevFingerStateMapRef = useRef({});
  const gestureDebounceRef = useRef(null);

  // ---------------------------------------------------------------------
  // FIX: MediaPipe's hands.onResults callback is registered ONCE inside a
  // useEffect and is invoked outside React's normal render/closure cycle.
  // Any component state read directly inside that callback is therefore
  // permanently "frozen" at whatever it was when the camera started —
  // it never sees subsequent updates. That stale-closure bug was the root
  // cause of: gameplay continuing past the last question, wrong mistake
  // counts, jumpy/unreliable gesture confirmation, and outcome screens
  // never appearing.
  //
  // Fix: mirror every piece of state the callback needs into refs (updated
  // every render), and read ONLY the refs inside the callback. The actual
  // answer-submission call is routed through a ref too, so the callback
  // always invokes the freshest version of handleAnswerSelection — which
  // itself closes over the correct currentQuestion/currentIndex/outcome
  // for whatever render produced it.
  // ---------------------------------------------------------------------
  const lockedAnswerRef = useRef(lockedAnswer);
  const canDetectGestureRef = useRef(canDetectGesture);
  const isTransitioningRef = useRef(isTransitioning);
  const outcomeRef = useRef(outcome);
  const handleAnswerSelectionRef = useRef(() => {});

  useEffect(() => { lockedAnswerRef.current = lockedAnswer; }, [lockedAnswer]);
  useEffect(() => { canDetectGestureRef.current = canDetectGesture; }, [canDetectGesture]);
  useEffect(() => { isTransitioningRef.current = isTransitioning; }, [isTransitioning]);
  useEffect(() => { outcomeRef.current = outcome; }, [outcome]);

  const totalQuestions = questions.length;

  const RUNNER_START = 50;
  const RUNNER_MIN = 6;
  const RUNNER_MAX = 94;
  const CORRECT_STEP = 10;
  const WRONG_STEP = 20;
  const runnerPosition = Math.max(
    RUNNER_MIN,
    Math.min(RUNNER_MAX, RUNNER_START + (correctCount * CORRECT_STEP) - (wrongCount * WRONG_STEP))
  );

  const letters = ['A', 'B', 'C', 'D'];
  const letterMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
  const currentChoices = displayQuestion?.choices || displayQuestion?.options || [];

  const correctChoiceIndex = displayQuestion
    ? (displayQuestion.correctIndex !== undefined
        ? Number(displayQuestion.correctIndex)
        : currentChoices.findIndex(
            (c) => c?.trim().toLowerCase() === displayQuestion.answer?.trim().toLowerCase()
          ))
    : null;

  const selectedIndex = (selectedOption && letterMap[selectedOption] !== undefined) ? letterMap[selectedOption] : null;
  const lockedIndex = (lockedAnswer && letterMap[lockedAnswer] !== undefined) ? letterMap[lockedAnswer] : null;

  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  useEffect(() => {
    if (outcome || showTutorial) return; // level already ended or tutorial active — no more question transitions

    setIsTransitioning(true);
    setCanDetectGesture(false);
    setGestureStatus('Loading...');
    setSelectedOption(null);
    setCurrentSelection(null);
    setIsConfirming(false);
    setConfirmProgress(0);
    setLastScoreChange(null);
    setExplanationText(null); // NEW: clear any previous explanation before the next question loads
    setDetectedFingers(0);
    setHandCount(0);
    setSelectHandActive(false);
    setConfirmHandActive(false);
    prevFingerStateMapRef.current = {};
    confirmHoldRef.current = 0;

    setCardPhase('out');

    const nextQuestion = questions[currentIndex];

    const swapTimer = setTimeout(() => {
      setDisplayQuestion(nextQuestion);
      setCardPhase('in');
    }, 280);

    setReadyBarFull(false);
    const barStartTimer = setTimeout(() => setReadyBarFull(true), 50);

    const readyTimer = setTimeout(() => {
      setIsTransitioning(false);
      setCanDetectGesture(true);
      setGestureStatus('Show 1-4 fingers on one hand (A-D)');
      setReadyBarFull(false);
    }, 1600);

    gestureDebounceRef.current = readyTimer;

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(barStartTimer);
      clearTimeout(readyTimer);
    };
  }, [currentIndex, outcome, showTutorial]);

  useEffect(() => {
    if (!secondsLimit || outcome || lockedAnswer || showTutorial || isTransitioning) return;

    setTimeLeft(secondsLimit);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAnswerSelectionRef.current(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, secondsLimit, outcome, lockedAnswer, showTutorial, isTransitioning]);

  const handleAnswerSelection = (optionLetter) => {
    // Guard against the level already having ended, or the question index
    // somehow being out of range (defensive — should never happen now that
    // the gesture loop respects outcomeRef, but cheap insurance).
    if (
      lockedAnswer ||
      outcome ||
      !currentQuestion ||
      currentIndex >= questions.length ||
      !canDetectGesture ||
      isTransitioning
    ) {
      return;
    }

    setLockedAnswer(optionLetter || 'TIMEOUT');

    const selectedIndexLocal = optionLetter ? letterMap[optionLetter] : -1;

    let isCorrect = false;
    if (currentQuestion.correctIndex !== undefined) {
      isCorrect = selectedIndexLocal === Number(currentQuestion.correctIndex);
    } else if (currentQuestion.answer) {
      const choices = currentQuestion.choices || currentQuestion.options || [];
      const correctChoiceText = currentQuestion.answer.trim().toLowerCase();
      const chosenChoiceText = choices[selectedIndexLocal]?.trim().toLowerCase();
      isCorrect = chosenChoiceText === correctChoiceText;
    }

    let updatedWrongCount = wrongCount;
    let updatedCorrectCount = correctCount;
    let updatedScore = score;
    let scoreChange = 0;

    // NEW: does this question carry an explanation to show on a wrong answer?
    const hasExplanation = !isCorrect && !!currentQuestion.explanation;

    if (isCorrect) {
      updatedScore += 10;
      updatedCorrectCount += 1;
      scoreChange = +10;
      setScore(updatedScore);
      setCorrectCount(updatedCorrectCount);
      setFeedback('correct');
    } else {
      updatedWrongCount += 1;
      updatedScore = Math.max(0, updatedScore - 20);
      scoreChange = -20;
      setWrongCount(updatedWrongCount);
      setFeedback('incorrect');
      if (hasExplanation) {
        setExplanationText(currentQuestion.explanation); // NEW
      }
    }

    setLastScoreChange(scoreChange);

    // NEW: give the player extra time to read the explanation before the
    // card swaps to the next question.
    const advanceDelay = hasExplanation ? ADVANCE_DELAY_WITH_EXPLANATION : ADVANCE_DELAY_DEFAULT;

    setTimeout(() => {
      setLockedAnswer(null);
      setSelectedOption(null);
      setCurrentSelection(null);
      setIsConfirming(false);
      selectedOptionRef.current = null;
      setFeedback(null);
      setExplanationText(null); // NEW: clear before advancing
      setConfirmProgress(0);
      setLastScoreChange(null);
      setDetectedFingers(0);
      setHandCount(0);
      setSelectHandActive(false);
      setConfirmHandActive(false);
      confirmHoldRef.current = 0;
      prevFingerStateMapRef.current = {};

      // 1) Too many mistakes -> eaten, regardless of how many questions remain.
      if (updatedWrongCount >= MAX_MISTAKES) {
        setOutcome('eaten');
        if (onComplete) {
          onComplete({
            outcome: 'eaten',
            completed: false,
            score: updatedScore,
            correctAnswers: updatedCorrectCount,
            totalQuestions,
            mistakes: updatedWrongCount,
          });
        }
        return;
      }

      // 2) Still more questions in this level -> advance.
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        return;
      }

      // 3) Finished every question in the level -> perfect or partial.
      const finalOutcome = updatedWrongCount === 0 ? 'perfect' : 'partial';
      setOutcome(finalOutcome);
      if (onComplete) {
        onComplete({
          outcome: finalOutcome,
          completed: finalOutcome === 'perfect',
          score: updatedScore,
          correctAnswers: updatedCorrectCount,
          totalQuestions,
          mistakes: updatedWrongCount,
        });
      }
    }, advanceDelay);
  };

  // Always keep the ref pointing at the freshest version of the handler,
  // so the MediaPipe callback (registered once) still calls current logic.
  useEffect(() => {
    handleAnswerSelectionRef.current = handleAnswerSelection;
  });

  // Mouse/touch fallback via AnswerChoices, routes through the same logic.
  const handleChoiceClick = (_choiceText, index) => {
    if (lockedAnswer || isTransitioning || outcome) return;
    handleAnswerSelectionRef.current(letters[index]);
  };

  const isFingerExtended = (landmarks, fingerIndex, wasExtended) => {
    const tipIndices = [8, 12, 16, 20];
    const pipIndices = [6, 10, 14, 18];
    const mcpIndices = [5, 9, 13, 17];

    const tip = landmarks[tipIndices[fingerIndex]];
    const pip = landmarks[pipIndices[fingerIndex]];
    const mcp = landmarks[mcpIndices[fingerIndex]];

    const tipAbovePip = tip.y < pip.y;
    const tipAboveMcp = tip.y < mcp.y;

    let confidence = 0;
    if (tipAbovePip) confidence++;
    if (tipAboveMcp) confidence++;

    return wasExtended ? confidence >= 1 : confidence >= 2;
  };

  const detectGesture = (landmarks, handedness, handIndex) => {
    const wrist = landmarks[0];

    if (!prevFingerStateMapRef.current[handIndex]) {
      prevFingerStateMapRef.current[handIndex] = [false, false, false, false];
    }
    const prevFingers = prevFingerStateMapRef.current[handIndex];

    const fingerExtended = [
      isFingerExtended(landmarks, 0, prevFingers[0]),
      isFingerExtended(landmarks, 1, prevFingers[1]),
      isFingerExtended(landmarks, 2, prevFingers[2]),
      isFingerExtended(landmarks, 3, prevFingers[3])
    ];

    prevFingerStateMapRef.current[handIndex] = fingerExtended;

    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const indexMcp = landmarks[5];
    const pinkyMcp = landmarks[17];

    const palmCenterX = (indexMcp.x + pinkyMcp.x) / 2;
    const thumbAwayFromPalm = Math.abs(thumbTip.x - palmCenterX) > Math.abs(landmarks[2].x - palmCenterX) * 1.1;
    const thumbTipDist = Math.hypot(thumbTip.x - wrist.x, thumbTip.y - wrist.y);
    const thumbIpDist = Math.hypot(thumbIp.x - wrist.x, thumbIp.y - wrist.y);
    const isThumbExtended = thumbAwayFromPalm || (thumbTipDist > thumbIpDist * 1.1);

    const extendedFingersCount = fingerExtended.filter(Boolean).length;

    let handType = 'unknown';
    let detectedOpt = null;

    if (extendedFingersCount === 4 && isThumbExtended) {
      handType = 'confirm';
    } else if (extendedFingersCount === 4) {
      handType = 'select';
      detectedOpt = 'D';
    } else if (extendedFingersCount === 3) {
      handType = 'select';
      detectedOpt = 'C';
    } else if (extendedFingersCount === 2) {
      handType = 'select';
      detectedOpt = 'B';
    } else if (extendedFingersCount === 1 || (isThumbExtended && extendedFingersCount === 0)) {
      handType = 'select';
      detectedOpt = 'A';
    }

    return { handType, detectedOpt, extendedFingersCount: extendedFingersCount + (isThumbExtended ? 1 : 0), fingerExtended, isThumbExtended };
  };

  useEffect(() => {
    if (showTutorial) return;

    let active = true;

    const setupCamera = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (handsRef.current) {
        handsRef.current.close();
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30, max: 30 },
            facingMode: 'user'
          }
        });

        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await new Promise((resolve) => {
            video.onloadedmetadata = () => {
              video.play();
              resolve();
            };
          });
        }

        setGestureStatus('Loading...');

        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        hands.onResults((results) => {
          if (!active) return;

          const canvasElement = canvasRef.current;
          if (!canvasElement) return;
          const canvasCtx = canvasElement.getContext('2d');

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

          // FIX: once the level has ended, stop all gesture processing.
          // Without this, the callback (stale-closure-free now, but still
          // running every frame) would keep reading hands and — before
          // this guard existed — kept invoking handleAnswerSelection well
          // past the last question.
          if (outcomeRef.current) {
            canvasCtx.restore();
            return;
          }

          const numHands = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;
          setHandCount(numHands);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            let totalFingers = 0;
            let firstSelection = null;
            let selectHandIndex = null;
            let confirmHandIndex = null;

            for (let hIndex = 0; hIndex < results.multiHandLandmarks.length; hIndex++) {
              const landmarks = results.multiHandLandmarks[hIndex];
              const handedness = results.multiHandedness[hIndex]?.label;
              const analysis = detectGesture(landmarks, handedness, hIndex);

              totalFingers += analysis.extendedFingersCount;

              if (analysis.handType === 'confirm' && confirmHandIndex === null) {
                confirmHandIndex = hIndex;
              }

              if (!firstSelection && analysis.handType === 'select' && analysis.detectedOpt) {
                firstSelection = analysis.detectedOpt;
                selectHandIndex = hIndex;
              }

              const isThisConfirmHand = analysis.handType === 'confirm';
              const hueColor = isThisConfirmHand ? '#34d399' : '#06b6d4';

              canvasCtx.strokeStyle = hueColor;
              canvasCtx.lineWidth = 2;
              for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
                const start = landmarks[startIdx];
                const end = landmarks[endIdx];
                canvasCtx.beginPath();
                canvasCtx.moveTo(start.x * canvasElement.width, start.y * canvasElement.height);
                canvasCtx.lineTo(end.x * canvasElement.width, end.y * canvasElement.height);
                canvasCtx.stroke();
              }

              canvasCtx.fillStyle = hueColor;
              for (const pt of landmarks) {
                canvasCtx.beginPath();
                canvasCtx.arc(pt.x * canvasElement.width, pt.y * canvasElement.height, 4, 0, 2 * Math.PI);
                canvasCtx.fill();
              }

              const wristPt = landmarks[0];
              const labelText = isThisConfirmHand ? 'CONFIRM ✋' : (analysis.handType === 'select' ? `SELECT: ${analysis.detectedOpt}` : '');
              if (labelText) {
                const labelX = wristPt.x * canvasElement.width;
                const labelY = wristPt.y * canvasElement.height + 24;
                canvasCtx.font = 'bold 13px sans-serif';
                canvasCtx.textAlign = 'center';
                canvasCtx.fillStyle = 'rgba(2,6,23,0.75)';
                const textWidth = canvasCtx.measureText(labelText).width;
                canvasCtx.fillRect(labelX - textWidth / 2 - 6, labelY - 14, textWidth + 12, 20);
                canvasCtx.fillStyle = hueColor;
                canvasCtx.fillText(labelText, labelX, labelY);
              }
            }

            const hasConfirmHand = confirmHandIndex !== null && confirmHandIndex !== selectHandIndex;

            setDetectedFingers(totalFingers);
            setCurrentSelection(firstSelection);
            setSelectHandActive(selectHandIndex !== null);
            setConfirmHandActive(hasConfirmHand);

            // FIX: read gating state from refs (always current), not from
            // the closed-over `lockedAnswer` / `canDetectGesture` /
            // `isTransitioning` state variables (frozen at camera-start time).
            const gestureBlocked =
              lockedAnswerRef.current || !canDetectGestureRef.current || isTransitioningRef.current;

            const activeSelection = firstSelection || selectedOptionRef.current;
            if (activeSelection && !gestureBlocked) {
              setSelectedOption(activeSelection);
            }

            const isConfirmingNow = activeSelection && hasConfirmHand && !gestureBlocked;
            setIsConfirming(isConfirmingNow);

            if (isConfirmingNow) {
              confirmHoldRef.current += 2;
              const progress = Math.min((confirmHoldRef.current / 20) * 100, 100);
              setConfirmProgress(progress);
              setGestureStatus(`✋ Confirming ${activeSelection}... hold steady`);

              if (confirmHoldRef.current >= 20) {
                // FIX: call through the ref so we always invoke the latest
                // handleAnswerSelection (correct currentQuestion/outcome/etc),
                // and immediately zero the hold so this can't double-fire
                // across the next couple of frames while state settles.
                confirmHoldRef.current = 0;
                setConfirmProgress(0);
                handleAnswerSelectionRef.current(activeSelection);
              }
            } else {
              confirmHoldRef.current = Math.max(0, confirmHoldRef.current - 3);
              setConfirmProgress((confirmHoldRef.current / 20) * 100);

              if (!gestureBlocked) {
                setGestureStatus(activeSelection
                  ? `${activeSelection} selected — raise your OTHER hand with an open palm (5 fingers) to confirm`
                  : `Show 1-4 fingers on one hand to pick A-D`
                );
              }
            }

          } else {
            setDetectedFingers(0);
            setCurrentSelection(null);
            setIsConfirming(false);
            setHandCount(0);
            setSelectHandActive(false);
            setConfirmHandActive(false);
            if (canDetectGestureRef.current && !isTransitioningRef.current) {
              setGestureStatus('Show 1-4 fingers on one hand to pick A-D');
            }
            setConfirmProgress(0);
            confirmHoldRef.current = 0;
          }

          canvasCtx.restore();
        });

        handsRef.current = hands;

        const processFrame = async () => {
          if (!active) return;
          const now = performance.now();
          if (now - lastProcessedTimeRef.current >= 25) {
            lastProcessedTimeRef.current = now;
            if (videoRef.current && videoRef.current.readyState >= 2) {
              await hands.send({ image: videoRef.current });
            }
          }
          if (active) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
          }
        };

        animationFrameRef.current = requestAnimationFrame(processFrame);

      } catch (error) {
        console.error("Camera error:", error);
        if (active) {
          setGestureStatus('Camera error');
        }
      }
    };

    setupCamera();

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [showTutorial]);

  const handleResetGame = () => {
    // 1. Fully stop any active camera stream tracks immediately on retry/reset
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }

    // 2. Reset core game state variables
    setDisplayQuestion(questions[0] || null);
    setCardPhase('in');
    setCurrentIndex(0);
    setScore(0);
    setWrongCount(0);
    setCorrectCount(0);
    setOutcome(null);
    setLockedAnswer(null);
    setSelectedOption(null);
    setCurrentSelection(null);
    setIsConfirming(false);
    setCanDetectGesture(false);
    setIsTransitioning(false);
    setSelectHandActive(false);
    setConfirmHandActive(false);
    setExplanationText(null); // NEW
    confirmHoldRef.current = 0;

    // 3. Set showTutorial to true so the retry tutorial/gesture guide shows up *without* opening the camera feed
    setShowTutorial(true);
  };
  // ---------- OUTCOME SCREENS ----------

  if (outcome === 'eaten') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900 rounded-2xl space-y-6 border border-red-900/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.4),transparent_60%)]" />
        <div className="text-7xl animate-bounce relative z-10">👹</div>
        <h3 className="text-4xl font-black text-red-400 relative z-10 tracking-tight">MONSTER ATE YOU!</h3>
        <p className="text-slate-300 max-w-md text-lg relative z-10">
          {wrongCount} mistakes (max {MAX_MISTAKES})<br />
          <span className="text-cyan-400 font-bold text-xl mt-2 block">Score: {score}</span>
        </p>
        <div className="flex gap-4 pt-4 relative z-10">
          <button
            onClick={handleResetGame}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black rounded-2xl transition-all flex items-center gap-3 cursor-pointer shadow-2xl shadow-cyan-500/30 hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" /> Retry
          </button>
          {onBackToLevels && (
            <button
              onClick={onBackToLevels}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all flex items-center gap-3 cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" /> Quit
            </button>
          )}
        </div>
      </div>
    );
  }

  if (outcome === 'perfect') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 rounded-2xl space-y-6 border border-emerald-900/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.4),transparent_60%)]" />
        <Trophy className="w-24 h-24 text-emerald-400 animate-bounce relative z-10" />
        <div className="relative z-10 space-y-1">
          <h3 className="text-4xl font-black text-emerald-400 tracking-tight">PERFECT ESCAPE!</h3>
          <p className="text-slate-300 text-lg">
            All {totalQuestions}/{totalQuestions} correct — flawless run!<br />
            <span className="text-cyan-400 font-bold text-2xl mt-2 block">Score: {score}</span>
          </p>
        </div>
        <div className="flex gap-4 pt-4 relative z-10">
          {hasNextLevel && onNextLevel ? (
            <button
              onClick={onNextLevel}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black rounded-2xl transition-all flex items-center gap-3 cursor-pointer shadow-2xl shadow-emerald-500/30 hover:scale-105"
            >
              <Play className="w-5 h-5" /> Next Level
            </button>
          ) : (
            onBackToLevels && (
              <button
                onClick={onBackToLevels}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black rounded-2xl transition-all flex items-center gap-3 cursor-pointer shadow-2xl shadow-cyan-500/30 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" /> Back to Main Menu
              </button>
            )
          )}
          <button
            onClick={handleResetGame}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all flex items-center gap-3 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-5 h-5" /> Replay
          </button>
        </div>
      </div>
    );
  }

  if (outcome === 'partial') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 rounded-2xl space-y-6 border border-amber-900/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.4),transparent_60%)]" />
        <Sparkles className="w-20 h-20 text-amber-400 relative z-10 animate-pulse" />
        <div className="relative z-10 space-y-1">
          <h3 className="text-4xl font-black text-amber-400 tracking-tight">SO CLOSE!</h3>
          <p className="text-slate-300 text-lg max-w-md">
            You escaped with <span className="text-amber-300 font-bold">{correctCount}/{totalQuestions}</span> correct — nearly a flawless run!<br />
            <span className="text-cyan-400 font-bold text-2xl mt-2 block">Score: {score}</span>
          </p>
          <p className="text-slate-500 text-sm">Nail all {totalQuestions} next time for a perfect escape.</p>
        </div>
        <div className="flex gap-4 pt-4 relative z-10">
          <button
            onClick={handleResetGame}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl transition-all flex items-center gap-3 cursor-pointer shadow-2xl shadow-amber-500/30 hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" /> Try Again
          </button>
          {onBackToLevels && (
            <button
              onClick={onBackToLevels}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all flex items-center gap-3 cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" /> Levels
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- ACTIVE GAMEPLAY ----------

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row gap-6 p-6 items-center justify-center">
      {!showTutorial && (
        <div className="absolute top-3 right-3 z-40 flex gap-2">
          <button
            onClick={handleResetGame}
            title="Restart this round"
            className="w-9 h-9 flex items-center justify-center bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onBackToLevels && (
            <button
              onClick={onBackToLevels}
              title="Back to levels"
              className="w-9 h-9 flex items-center justify-center bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {showTutorial && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-2xl">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-cyan-400">
              <Hand className="w-6 h-6 animate-pulse" /> Controls
            </div>

            {tutorialStep === 1 ? (
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-cyan-500/30 p-5 rounded-xl flex flex-col items-center gap-3">
                  <p className="text-xs text-cyan-300 font-bold uppercase">Step 1 · Select with Hand 1</p>
                  <div className="grid grid-cols-2 gap-3 text-sm text-cyan-300 font-bold">
                    <span className="bg-cyan-500/20 p-2.5 rounded-lg border border-cyan-500/40">☝️ 1 finger = A</span>
                    <span className="bg-cyan-500/20 p-2.5 rounded-lg border border-cyan-500/40">✌️ 2 fingers = B</span>
                    <span className="bg-cyan-500/20 p-2.5 rounded-lg border border-cyan-500/40">🤟 3 fingers = C</span>
                    <span className="bg-cyan-500/20 p-2.5 rounded-lg border border-cyan-500/40">🖖 4 fingers = D</span>
                  </div>
                </div>
                <button
                  onClick={() => setTutorialStep(2)}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-emerald-500/30 p-5 rounded-xl flex flex-col items-center gap-3">
                  <p className="text-xs text-emerald-400 font-bold uppercase">Step 2 · Confirm with Hand 2</p>
                  <div className="text-3xl animate-bounce">☝️ + 🖐️</div>
                  <p className="text-sm text-slate-300">Keep Hand 1 showing your answer, then raise your <span className="text-emerald-400 font-bold">other hand</span> with all 5 fingers open (open palm) to lock it in.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTutorialStep(1)}
                    className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setShowTutorial(false)}
                    className="w-2/3 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer shadow-lg"
                  >
                    Start
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-full max-w-xl shadow-2xl">
        <div>
          <GameTrack
            current={correctCount}
            total={totalQuestions}
            progressPercent={runnerPosition}
            feedback={feedback}
          />

          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/30">
                Question {Math.min(currentIndex + 1, totalQuestions)}/{totalQuestions}
              </span>
              <span className="text-[10px] font-semibold px-2 py-1.5 bg-slate-800 text-slate-400 rounded-lg border border-slate-700">
                {wrongCount}/{MAX_MISTAKES} mistakes
              </span>
            </div>
            <div className="flex items-center gap-2">
              {lastScoreChange && (
                <span className={`text-sm font-black px-3 py-1 rounded-lg ${lastScoreChange > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} animate-pulse`}>
                  {lastScoreChange > 0 ? '+' : ''}{lastScoreChange}
                </span>
              )}
              <span className="text-xs font-bold px-3 py-1.5 bg-slate-800 text-cyan-400 rounded-lg border border-slate-700">
                {score} pts
              </span>
              {secondsLimit && (
                <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${timeLeft <= 5 ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  <Timer className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>
              )}
            </div>
          </div>

          <h3
            className={`text-xl font-bold text-slate-100 mb-6 leading-snug transition-all duration-300 ease-out ${cardPhase === 'out' ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'}`}
          >
            {displayQuestion?.question}
          </h3>
        </div>

        <div className={`transition-all duration-300 ease-out ${cardPhase === 'out' ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'}`}>
          <AnswerChoices
            choices={currentChoices}
            onSelect={handleChoiceClick}
            selectedIndex={selectedIndex}
            lockedIndex={lockedIndex}
            correctIndex={correctChoiceIndex}
            showResult={!!lockedAnswer}
            disabled={!!lockedAnswer || isTransitioning}
          />

          {/* NEW: wrong-answer explanation, shown only when the question data provides one */}
          {feedback === 'incorrect' && explanationText && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex gap-3 items-start text-left animate-in fade-in duration-300">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-100 leading-relaxed">
                <span className="font-bold text-amber-400">Why: </span>
                {explanationText}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="rounded-xl border-2 border-slate-700 object-cover transform -scale-x-100 shadow-2xl"
        />

        <div className="absolute top-4 left-4 right-4 flex gap-2 pointer-events-none">
          <div className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${selectHandActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900/70 border-slate-700 text-slate-500'}`}>
            ☝️ Hand 1: Select {currentSelection ? `(${currentSelection})` : ''}
          </div>
          <div className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${confirmHandActive ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-900/70 border-slate-700 text-slate-500'}`}>
            🖐️ Hand 2: Confirm
          </div>
        </div>

        {confirmProgress > 0 && (
          <div className="absolute top-14 w-11/12 bg-slate-900/95 rounded-full h-3 overflow-hidden border-2 border-slate-600 shadow-lg">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-100"
              style={{ width: `${confirmProgress}%` }}
            />
          </div>
        )}

        <div className="absolute bottom-4 bg-slate-950/95 backdrop-blur-md border-2 border-slate-700 px-5 py-3 rounded-xl text-sm shadow-2xl max-w-[500px] w-11/12 text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <span className={`w-3 h-3 rounded-full shrink-0 ${isTransitioning ? 'bg-amber-400' : canDetectGesture ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="text-slate-200 font-semibold text-xs leading-snug">
              {isTransitioning ? 'Get ready for the next question...' : gestureStatus}
            </span>
          </div>
          {isTransitioning && (
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all ease-linear"
                style={{ width: readyBarFull ? '100%' : '0%', transitionDuration: '1550ms' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};