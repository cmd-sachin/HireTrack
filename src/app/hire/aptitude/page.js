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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spinner,
} from "@nextui-org/react";
import {
  Clock,
  AlertCircle,
  ArrowRight,
  ListChecks,
  Brain,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAptitudeStore } from "../../store/aptitudeStore";

const TOTAL_QUESTIONS = 10;
const DEFAULT_TIMER_SECONDS = 60;

export default function QuizPage() {
  const router = useRouter();
  const { quizData, addOrUpdateQuizData } = useAptitudeStore();

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
  const [showReviewModal, setShowReviewModal] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Reset when moving to a new question
    setTimer(DEFAULT_TIMER_SECONDS);
    setIsTimerActive(true);
    setIsTimerWarning(false);
    setSelectedOption("");
    setValidationError("");
  }, [currentQuestionIndex]);

  // Function to fetch a dynamic question from your API
  const fetchNextDynamicQuestion = async () => {
    try {
      setLoadingNextQuestion(true);
      console.log("Fetching next dynamic question...");

      const response = await fetch("/api/questionGeneration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: "aptitude", messages: messages }),
      });

      const data = await response.json();
      console.log("API response data:", data);

      if (!data || typeof data.question !== "string") {
        throw new Error(
          "Invalid question data received from API: " + JSON.stringify(data)
        );
      }

      // Update conversation history
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

      // Construct new question object
      const newQuestion = {
        section: "Aptitude",
        question: data.question,
        inputType: "radio", // Only radio input is accepted
        options: data.options || [],
        required: true,
      };

      // Update the questions state
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
      setShowReviewModal(true);
    }
  };

  const handleFinishQuiz = () => {
    setShowReviewModal(false);
    router.push("../analysis");
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

  if (loading || loadingNextQuestion || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <Spinner color="primary" size="lg" />
          <p className="mt-4 text-lg font-medium text-gray-700 animate-pulse">
            {loadingNextQuestion
              ? "Loading your next question..."
              : "Preparing the quiz..."}
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
              endContent={
                isLastQuestion ? (
                  <ListChecks size={18} />
                ) : (
                  <ArrowRight size={18} />
                )
              }
              onPress={() => handleNextQuestion()}
              isDisabled={isQuestionRequired && !selectedOption}
              size="lg"
            >
              {isLastQuestion ? "Review & Finish" : "Next Question"}
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

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        size="lg"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-[#031930] to-[#223A59] text-white">
            <h3 className="text-xl font-semibold text-center">
              Review Your Answers
            </h3>
            <p className="text-sm text-[#B3D6F9] text-center">
              Please review your responses before submitting the assessment.
            </p>
          </ModalHeader>
          <ModalBody className="px-6 py-4">
            {questions.map((q, index) => {
              const answerObj = (Array.isArray(quizData) ? quizData : []).find(
                (item) => item.questionNumber === index + 1
              );
              return (
                <div
                  key={index}
                  className="mb-5 p-4 rounded-lg border border-[#D1DDED] bg-[#F8FAFD]"
                >
                  <h4 className="text-base font-semibold text-[#223A59]">
                    Q{index + 1}: {q.question}
                  </h4>
                  <p className="mt-2 text-[#758BA5]">
                    {answerObj ? (
                      <span>
                        Your answer:{" "}
                        <span className="text-[#3684DB] font-medium">
                          {answerObj.response}
                        </span>
                      </span>
                    ) : (
                      "No answer provided"
                    )}
                  </p>
                </div>
              );
            })}
            <div className="flex justify-center mt-6 mb-2">
              <Button
                className="bg-[#3684DB] text-white hover:bg-[#2D6FC0] transition-all duration-300 px-8 py-2"
                size="lg"
                onPress={handleFinishQuiz}
              >
                Submit Assessment
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
