"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Radio,
  RadioGroup,
  Spinner,
} from "@nextui-org/react";
import { Clock, AlertCircle, ArrowRight, Loader2, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAptitudeStore } from "../../store/aptitudeStore";
import useAssessmentStore from "../../store/assessmentStore"; // import assessment store

const TOTAL_QUESTIONS = 10;
const DEFAULT_TIMER_SECONDS = 60;

export default function QuizPage() {
  const router = useRouter();
  const { quizData, addOrUpdateQuizData } = useAptitudeStore();
  const { completeAssessment } = useAssessmentStore(); // get store function

  // Dynamic questions state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(DEFAULT_TIMER_SECONDS);

  // Conversation history
  const [messages, setMessages] = useState([
    { role: "user", content: "Start the test" },
  ]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isTimerWarning, setIsTimerWarning] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);

  const progressPercentage =
    ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === TOTAL_QUESTIONS - 1;
  const isQuestionRequired = currentQuestion?.required !== false;

  // Load the first dynamic question if none exist
  useEffect(() => {
    if (questions.length === 0) {
      fetchNextDynamicQuestion();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isTimerActive) {
      const intervalId = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isTimerActive]);

  useEffect(() => {
    setIsTimerWarning(timer <= 10);
  }, [timer]);

  useEffect(() => {
    if (timer === 0) {
      setIsTimerActive(false);
      handleNextQuestion(true);
    }
  }, [timer]);

  useEffect(() => {
    // Reset timer and clear previous answer/validation on question change
    setTimer(DEFAULT_TIMER_SECONDS);
    setIsTimerActive(true);
    setIsTimerWarning(false);
    setSelectedOption("");
    setValidationError("");
  }, [currentQuestionIndex]);

  const fetchNextDynamicQuestion = async () => {
    try {
      setLoadingNextQuestion(true);

      const response = await fetch("/api/questionGeneration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: "aptitude", messages: messages }),
      });

      const data = await response.json();

      if (!data || typeof data.question !== "string") {
        throw new Error(
          "Invalid question data received from API: " + JSON.stringify(data)
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: JSON.stringify({
            question: data.question,
            options: data.options || [],
          }),
        },
      ]);

      const newQuestion = {
        section: "Aptitude",
        question: data.question,
        inputType: "radio",
        options: data.options || [],
        required: true,
      };

      setQuestions((prev) => [...prev, newQuestion]);
      setLoadingNextQuestion(false);
      console.log("Dynamic question loaded:", newQuestion);
    } catch (err) {
      console.error("Error fetching dynamic question:", err);
      setError(`Failed to fetch the next question: ${err.message}`);
      setLoadingNextQuestion(false);
    }
  };

  const getCurrentAnswer = () => selectedOption;

  const validateAnswer = () => {
    if (!currentQuestion) return false;
    if (!isQuestionRequired) return true;

    if (!selectedOption) {
      setValidationError("Please select an option to continue.");
      return false;
    }
    return true;
  };

  const handleNextQuestion = async (autoSubmit = false) => {
    if (!autoSubmit && !validateAnswer()) return;
    setValidationError("");

    const currentAnswer = getCurrentAnswer();

    // Save current question's answer
    addOrUpdateQuizData({
      questionNumber: currentQuestionIndex + 1,
      question: currentQuestion.question,
      options: currentQuestion.options || [],
      response: currentAnswer,
    });

    // Update conversation history
    setMessages((prev) => [...prev, { role: "user", content: currentAnswer }]);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < TOTAL_QUESTIONS) {
      await fetchNextDynamicQuestion();
      setCurrentQuestionIndex(nextIndex);
    } else {
      // If autoSubmit is true (i.e. timer expired on the last question),
      // finish the quiz automatically.
      if (autoSubmit) {
        handleFinishQuiz();
      }
      // Otherwise, the user can click "Finish" manually.
    }
  };

  const handleFinishQuiz = () => {
    setFinishLoading(true);
    // Mark the current round as completed in the store.
    // In this example, we assume this quiz is for the "aptitude" round.
    completeAssessment("aptitude");
    // Redirect to the /hire page after updating the status.
    router.push("/hire");
  };

  const formatTime = (seconds) => {
    const sec = Number(seconds);
    if (isNaN(sec)) return "0:00";
    if (sec < 60) return `${sec}s`;
    const minutes = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${minutes}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  // Render only radio options
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;
    return (
      <RadioGroup
        value={selectedOption}
        onValueChange={(value) => {
          setSelectedOption(value);
          setValidationError("");
        }}
        className="gap-3 space-y-3"
        orientation="vertical"
      >
        {currentQuestion.options.map((option, index) => (
          <Radio
            key={index}
            value={option}
            className="border border-gray-300 rounded-lg p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-500 transition-transform duration-150 transform hover:scale-[1.02]"
          >
            <span className="text-[#223A59] font-medium">{option}</span>
          </Radio>
        ))}
      </RadioGroup>
    );
  };

  if (loading || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F5F9FF] to-[#E3F2FD] p-6">
        <div className="bg-white rounded-xl shadow-xl p-10 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-[#3684DB] border-opacity-20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#3684DB] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-xl font-semibold text-[#223A59] animate-pulse">
            {loadingNextQuestion
              ? "Generating your next question..."
              : "Preparing personalized quiz..."}
          </p>
          <p className="text-sm text-[#667D99] mt-2 text-center">
            Just a moment while we craft your assessment
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="flex flex-col gap-1 items-center bg-red-50 text-red-700 border-b border-red-200">
            <AlertCircle size={40} className="text-red-600" />
            <h2 className="text-xl font-bold mt-2">Error Occurred</h2>
          </CardHeader>
          <CardBody className="text-center py-6">
            <p className="mb-4 text-gray-800">{error}</p>
            <Button
              color="primary"
              onPress={() => setError(null)}
              className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md"
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#031930] to-[#223A59] py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Aptitude Assessment
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#D0E6FF] max-w-2xl mx-auto">
            Analyze your problem-solving abilities with this timed quiz.
          </p>
        </div>
      </div>

      {/* Quiz Progress */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-[#3684DB]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E8F1FF] rounded-full flex items-center justify-center shadow-sm">
                <Brain className="w-6 h-6 text-[#3684DB]" />
              </div>
              <div>
                <h2 className="font-bold text-[#223A59]">Aptitude Test</h2>
                <p className="text-xs text-[#667D99]">
                  Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 font-mono text-[#223A59]">
              <Clock
                size={18}
                className={`${
                  isTimerWarning ? "text-red-500 animate-pulse" : ""
                }`}
              />
              <span
                className={`${
                  isTimerWarning
                    ? "text-red-500 font-semibold animate-pulse"
                    : ""
                }`}
              >
                {formatTime(timer)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="text-xs font-medium text-[#667D99] mb-2">
              Progress: {Math.round(progressPercentage)}%
            </div>
            <div className="relative h-2 rounded-full bg-[#E0E8F1] overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-[#3684DB] transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mt-6 bg-white shadow-lg border border-[#D1DDED] rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#F8FAFD] to-[#E8F1FF] border-b border-[#D1DDED] px-6 py-4">
            <h3 className="text-lg font-semibold text-[#223A59] tracking-wide">
              Question {currentQuestionIndex + 1}
            </h3>
          </CardHeader>
          <CardBody className="py-6 px-6 space-y-4">
            <p className="text-[#223A59] text-lg font-medium leading-relaxed">
              {currentQuestion?.question}
            </p>

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Options */}
            {renderQuestionInput()}
          </CardBody>
          <CardFooter className="flex justify-end bg-[#F8FAFD] border-t border-[#D1DDED] px-6 py-4">
            <Button
              className="bg-[#3684DB] text-white hover:bg-[#2D6FC0] shadow-md transition-all duration-300"
              onPress={() =>
                isLastQuestion ? handleFinishQuiz() : handleNextQuestion()
              }
              isDisabled={
                (isQuestionRequired && !selectedOption) || loadingNextQuestion
              }
              size="lg"
            >
              {loadingNextQuestion || finishLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <span className="flex items-center">
                  {isLastQuestion ? "Finish" : "Next Question"}
                  {!isLastQuestion && <ArrowRight size={18} className="ml-2" />}
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Information Card */}
        <div className="mt-6 bg-white shadow-md rounded-lg p-5 border border-[#D1DDED]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#3684DB] mt-1" />
            <div>
              <h3 className="font-semibold text-[#223A59]">
                Assessment Information
              </h3>
              <p className="text-sm text-[#667D99]">
                Each question has a time limit of {formatTime(timer)}. Answers
                are saved automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
