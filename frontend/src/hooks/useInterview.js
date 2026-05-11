import { useState, useCallback, useRef, useEffect } from "react";
import { generateQuestion, evaluateAnswer, adjustDifficulty } from "../lib/api";

export function useInterview() {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [sources, setSources] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);

  // Voice States
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const recognitionRef = useRef(null);
  const lastSpokenQuestionId = useRef(null);
  const stateRef = useRef({ isSpeaking, isVoiceMode, evaluation });
  const voicesRef = useRef([]);
  // Controls whether recognition should auto-restart after Chrome stops it
  const shouldListenRef = useRef(false);

  useEffect(() => {
    stateRef.current = { isSpeaking, isVoiceMode, evaluation };
  }, [isSpeaking, isVoiceMode, evaluation]);

  // Preload voices — Chrome returns [] on first getVoices() call until voiceschanged fires
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis?.getVoices() || [];
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const addMessage = (type, content, extra = {}) => {
    setMessages((prev) => [...prev, { type, content, ...extra }]);
  };

  /**
   * Speech-to-Text (STT)
   */
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage("system", "Speech Recognition not supported in this browser.");
      return;
    }

    shouldListenRef.current = true;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalPart = "";
      let interimPart = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalPart += event.results[i][0].transcript;
        } else {
          interimPart += event.results[i][0].transcript;
        }
      }
      if (finalPart) {
        setTranscript((prev) => (prev + " " + finalPart).trim());
        setInterimTranscript("");
      } else if (interimPart) {
        setInterimTranscript(interimPart);
      }
    };

    recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are non-fatal — auto-restart handles them
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("Speech Recognition Error", event.error);
      }
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      // Chrome auto-stops recognition even with continuous:true — restart if we should still be listening
      if (shouldListenRef.current && stateRef.current.isVoiceMode && !stateRef.current.evaluation) {
        setTimeout(() => {
          if (shouldListenRef.current) startListening();
        }, 300);
      }
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setInterimTranscript("");
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setIsListening(false);
  }, []);

  /**
   * Text-to-Speech (TTS)
   */
  const speakText = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;

    // Stop any in-progress listening before speaking
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    window.speechSynthesis.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = voicesRef.current;
      const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
      const bestVoice =
        englishVoices.find((v) =>
          v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium")
        ) ||
        englishVoices[0] ||
        voices[0];
      if (bestVoice) utterance.voice = bestVoice;

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsListening(false);
      };

      // Chrome silently pauses speech synthesis on long text — periodic resume() fixes it
      const resumeInterval = setInterval(() => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      }, 5000);

      const safetyTimeout = setTimeout(() => {
        clearInterval(resumeInterval);
        if (stateRef.current.isSpeaking) {
          console.warn("Speech synthesis safety timeout reached.");
          setIsSpeaking(false);
        }
      }, 15000);

      const cleanup = () => {
        clearInterval(resumeInterval);
        clearTimeout(safetyTimeout);
      };

      utterance.onend = () => {
        cleanup();
        setIsSpeaking(false);
        // Do NOT auto-start listening — user taps "Start Speaking" manually
      };

      utterance.onerror = (e) => {
        cleanup();
        console.error("SpeechSynthesis Error", e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }, 50);
  }, []);

  // Trigger speech when voice mode is enabled and a new question is present
  useEffect(() => {
    const qId = currentQuestion?.question_id;
    if (isVoiceMode && currentQuestion && !evaluation && !isSpeaking && !isListening && !isLoading) {
      if (lastSpokenQuestionId.current !== qId) {
        lastSpokenQuestionId.current = qId;
        speakText(currentQuestion.question);
      }
    }
  }, [isVoiceMode, currentQuestion, evaluation, isSpeaking, isListening, isLoading, speakText]);

  const startInterview = async (focusArea = null) => {
    setIsLoading(true);
    setEvaluation(null);
    setTranscript("");
    setInterimTranscript("");
    try {
      if (!sessionId) {
        addMessage("system", "Starting new interview session...");
      }

      const res = await generateQuestion(sessionId, difficulty, focusArea);

      if (!sessionId) setSessionId(res.session_id);
      setCurrentQuestion(res);
      setDifficulty(res.difficulty);
      setSources(res.sources);

      addMessage("question", res.question, {
        difficulty: res.difficulty,
        topic: res.topic,
        sources: res.sources,
      });
    } catch (err) {
      addMessage("system", `Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (answerText) => {
    const finalAnswer =
      typeof answerText === "string" && answerText.trim() ? answerText : transcript;

    if (!currentQuestion || !finalAnswer.trim()) {
      console.warn("Submit ignored: No answer content");
      return;
    }

    stopListening();
    setIsLoading(true);
    setInterimTranscript("");
    addMessage("answer", finalAnswer);

    try {
      const res = await evaluateAnswer(
        sessionId,
        currentQuestion.question_id,
        currentQuestion.question,
        finalAnswer,
        difficulty,
        currentQuestion.sources.map((s) => s.text)
      );

      setEvaluation(res);
      setDifficulty(res.new_difficulty);

      if (res.weak_areas.length > 0) {
        setWeakAreas(res.weak_areas);
      }

      addMessage("evaluation", "", {
        score: res.score,
        feedback: res.feedback,
        modelAnswer: res.model_answer,
        weakAreas: res.weak_areas,
      });

      if (isVoiceMode) {
        const feedbackSummary = `Evaluation complete. Your score is ${res.score}. ${res.feedback.split(".")[0]}.`;
        lastSpokenQuestionId.current = `eval-${currentQuestion.question_id}`;
        speakText(feedbackSummary);
      }
    } catch (err) {
      addMessage("system", `Error evaluating answer: ${err.message}`);
    } finally {
      setIsLoading(false);
      setTranscript("");
    }
  };

  const nextQuestion = () => {
    setEvaluation(null);
    startInterview();
  };

  const changeDifficulty = async (direction) => {
    setIsLoading(true);
    try {
      const res = await adjustDifficulty(sessionId, direction);
      setDifficulty(res.new_difficulty);
      addMessage("system", `Difficulty updated to ${res.new_difficulty.toUpperCase()}`);
      nextQuestion();
    } catch (err) {
      addMessage("system", `Error adjusting difficulty: ${err.message}`);
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    shouldListenRef.current = false;
    setSessionId(null);
    setCurrentQuestion(null);
    setDifficulty("intermediate");
    setMessages([]);
    setEvaluation(null);
    setSources([]);
    setWeakAreas([]);
    setIsVoiceMode(false);
    setTranscript("");
    setInterimTranscript("");
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const toggleVoiceMode = () => {
    const newMode = !isVoiceMode;
    setIsVoiceMode(newMode);
    if (!newMode) {
      shouldListenRef.current = false;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      stopListening();
    }
  };

  return {
    sessionId,
    currentQuestion,
    difficulty,
    messages,
    isLoading,
    evaluation,
    sources,
    weakAreas,
    isVoiceMode,
    isSpeaking,
    isListening,
    transcript,
    interimTranscript,
    setTranscript,
    startInterview,
    submitAnswer,
    nextQuestion,
    changeDifficulty,
    resetSession,
    toggleVoiceMode,
    startListening,
    stopListening,
  };
}
