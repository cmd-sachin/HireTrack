"use client";

import React, { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { User, Mic, ArrowLeft, Briefcase } from "lucide-react";
import Link from "next/link";

// Error checking helper function
export const isPublicKeyMissingError = ({ vapiError }) => {
  return (
    !!vapiError &&
    vapiError.error.statusCode === 403 &&
    vapiError.error.error === "Forbidden"
  );
};

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

// Custom hook for API key validation
const usePublicKeyInvalid = () => {
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    if (showMsg) {
      const timer = setTimeout(() => setShowMsg(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showMsg]);

  return { showMsg, setShowMsg };
};

// Button component with consistent styling
const Button = ({
  label,
  onClick,
  isLoading,
  disabled,
  variant = "primary",
  icon,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center py-3 px-6 text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg";

  const variantClasses = {
    primary: "bg-[#3684DB] text-white hover:bg-[#2D6FC0]",
    secondary:
      "bg-white text-[#3684DB] border-2 border-[#D1DDED] hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-t-transparent border-current rounded-full animate-spin mr-2" />
          <span>Processing...</span>
        </div>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </>
      )}
    </button>
  );
};

// VolumeLevel component with improved styling
const VolumeLevel = ({ volume, label }) => {
  const numBars = 12;
  return (
    <div className="w-full bg-[#F5F9FF] rounded-lg p-4 shadow-inner">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[#223A59] font-medium">{label}</div>
        <div className="text-[#3684DB] font-bold">
          {Math.round(volume * 100)}%
        </div>
      </div>
      <div className="flex items-end gap-1 h-16">
        {Array.from({ length: numBars }, (_, i) => {
          const barHeight = `${Math.min(
            100,
            Math.max(15, volume > i / numBars ? 100 : 15)
          )}%`;

          // Generate a color gradient from blue to green based on index
          const isActive = volume > i / numBars;
          const barColor = isActive
            ? i < numBars * 0.3
              ? "bg-[#3684DB]"
              : i < numBars * 0.6
              ? "bg-[#3698DB]"
              : "bg-[#36BDB5]"
            : "bg-[#D1DDED]";

          return (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all duration-200 ${barColor}`}
              style={{ height: barHeight }}
            />
          );
        })}
      </div>
    </div>
  );
};

// Speech status indicator component
const SpeechStatusIndicator = ({ isSpeaking, type }) => {
  const colors = {
    hr: { active: "bg-[#36BDB5]", inactive: "bg-[#D1DDED]" },
    candidate: { active: "bg-[#3684DB]", inactive: "bg-[#D1DDED]" },
  };

  const color = isSpeaking ? colors[type].active : colors[type].inactive;

  return (
    <div className="flex items-center mb-3">
      <div
        className={`w-3 h-3 rounded-full ${color} mr-2 transition-colors duration-300`}
      />
      <span className="text-sm text-[#758BA5]">
        {isSpeaking ? "Speaking" : "Not speaking"}
      </span>
    </div>
  );
};

// Main interview status component
const InterviewStatus = ({ timeElapsed, currentQuestion }) => {
  return (
    <div className="bg-[#F5F9FF] rounded-lg p-4 border border-[#D1DDED] mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[#223A59] font-semibold">Interview Progress</h3>
        <div className="text-[#758BA5]">{timeElapsed}</div>
      </div>
      <div className="text-[#3684DB] font-medium">Current Topic:</div>
      <div className="text-[#031930] mt-1">{currentQuestion}</div>
    </div>
  );
};

export default function HRAgentPage() {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [candidateIsSpeaking, setCandidateIsSpeaking] = useState(false);
  const [hrVolume, setHrVolume] = useState(0);
  const [candidateVolume, setCandidateVolume] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState("00:00");
  const [currentQuestion, setCurrentQuestion] = useState(
    "Introduction and background"
  );
  const { showMsg, setShowMsg } = usePublicKeyInvalid();
  const [micError, setMicError] = useState(false);

  // Timer effect for interview duration
  useEffect(() => {
    let timer;
    if (connected) {
      let seconds = 0;
      timer = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setTimeElapsed(
          `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`
        );

        // Simulate changing questions based on time
        if (seconds === 30) setCurrentQuestion("Work experience and skills");
        if (seconds === 90) setCurrentQuestion("Career goals and aspirations");
        if (seconds === 150) setCurrentQuestion("Role-specific questions");
        if (seconds === 210) setCurrentQuestion("Closing and next steps");
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [connected]);

  // Set up Vapi event listeners
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
      setShowMsg(false);
    });

    vapi.on("call-end", () => {
      setConnected(false);
      setConnecting(false);
      setShowMsg(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setHrVolume(level / 100);
    });

    vapi.on("error", (error) => {
      console.error(error);
      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowMsg(true);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulate candidate volume and speaking state updates when connected
  useEffect(() => {
    let volumeInterval, speakingInterval;
    if (connected) {
      volumeInterval = setInterval(() => {
        setCandidateVolume(Math.random());
      }, 200);

      speakingInterval = setInterval(() => {
        setCandidateIsSpeaking((prev) => !prev);
      }, 3000);
    }
    return () => {
      if (volumeInterval) clearInterval(volumeInterval);
      if (speakingInterval) clearInterval(speakingInterval);
    };
  }, [connected]);

  // Request microphone permission before starting the call
  const startCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicError(false);
      setConnecting(true);
      vapi.start(process.env.NEXT_PUBLIC_ASSISTANT_ID);
    } catch (error) {
      console.error("Microphone permission error:", error);
      setMicError(true);
      setTimeout(() => setMicError(false), 3000);
    }
  };

  const endCall = () => {
    vapi.stop();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-[#D1DDED]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-[#3684DB]" />
            <h1 className="text-2xl font-bold text-[#031930]">HireTrack</h1>
          </Link>

          <Link
            href="/hire"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-full shadow-sm transition-all hover:bg-blue-600 hover:shadow-md hover:-translate-y-px"
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#031930]">
            AI-Powered HR Interview
          </h1>
          <p className="mt-3 text-[#758BA5] max-w-2xl mx-auto">
            Practice your interview skills with Gwen, our AI-powered HR
            recruiter. Get comfortable answering common interview questions
            before your real interviews.
          </p>
        </div>

        {!connected ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#F5F9FF] rounded-xl p-8 shadow-md border border-[#D1DDED] mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#3684DB] rounded-full flex items-center justify-center text-white">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#223A59]">
                    Meet Gwen
                  </h2>
                  <p className="text-[#758BA5]">HR Recruiter at HireTrack</p>
                </div>
              </div>
              <p className="text-[#031930] mb-6">
                Gwen will conduct an actual job interview, asking you about your
                experience, skills, and career goals. She&apos;ll provide a
                comprehensive assessment of your interview performance
                afterward.
              </p>
              <h3 className="font-semibold text-[#223A59] mb-2">
                Interview Instructions:
              </h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#3684DB] flex items-center justify-center text-white text-xs">
                    1
                  </div>
                  <span className="text-[#758BA5]">
                    Make yourself in a noiseless environment
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#3684DB] flex items-center justify-center text-white text-xs">
                    2
                  </div>
                  <span className="text-[#758BA5]">
                    Ensure you have microphone availability
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#3684DB] flex items-center justify-center text-white text-xs">
                    3
                  </div>
                  <span className="text-[#758BA5]">
                    Don&apos;t end the call in between the interview
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#3684DB] flex items-center justify-center text-white text-xs">
                    4
                  </div>
                  <span className="text-[#758BA5]">
                    Maintain the integrity of the interview, any mall practises
                    will disband the call.
                  </span>
                </li>
              </ul>
              <div className="bg-[#EFF6FF] p-4 rounded-lg border border-[#D1DDED] mb-6">
                <p className="text-[#223A59] text-sm">
                  <strong>Note:</strong> Make sure your microphone is working
                  properly and you&apos;re in a quiet environment for the best
                  experience.
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  label="Start Interview"
                  onClick={startCall}
                  isLoading={connecting}
                  icon={<Mic className="w-5 h-5" />}
                />
              </div>
            </div>
            {showMsg && (
              <div className="fixed bottom-6 left-6 px-4 py-3 bg-red-500 text-white rounded-lg shadow-lg animate-fade-in-out">
                API Key Error: Please check your Vapi Public Key configuration.
              </div>
            )}
            {micError && (
              <div className="fixed bottom-6 right-6 px-4 py-3 bg-red-500 text-white rounded-lg shadow-lg animate-fade-in-out">
                Microphone permission is required to start the interview.
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <InterviewStatus
              timeElapsed={timeElapsed}
              currentQuestion={currentQuestion}
            />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Candidate Card */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-[#D1DDED]">
                <div className="flex items-center mb-6">
                  <User className="h-6 w-6 text-[#3684DB] mr-2" />
                  <h2 className="text-xl font-semibold text-[#223A59]">
                    You (Candidate)
                  </h2>
                </div>
                <SpeechStatusIndicator
                  isSpeaking={candidateIsSpeaking}
                  type="candidate"
                />
                <VolumeLevel volume={candidateVolume} label="Your Volume" />
              </div>

              {/* HR - Gwen Card */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-[#D1DDED]">
                <div className="flex items-center mb-6">
                  <Mic className="h-6 w-6 text-[#36BDB5] mr-2" />
                  <h2 className="text-xl font-semibold text-[#223A59]">
                    Gwen (HR Recruiter)
                  </h2>
                </div>
                <SpeechStatusIndicator
                  isSpeaking={assistantIsSpeaking}
                  type="hr"
                />
                <VolumeLevel volume={hrVolume} label="Gwen's Volume" />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                label="End Interview"
                onClick={endCall}
                variant="danger"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#F5F9FF] py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-t border-[#D1DDED] pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#758BA5]">
              © 2025 HireTrack. All Rights Reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {/* Add additional links here if needed */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
