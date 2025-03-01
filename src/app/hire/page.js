"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Code,
  Users,
  Lock,
  CheckCircle,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import Navbar from "../components/NavBar";

export default function Assessment() {
  // State to track which assessment modules are unlocked and completed
  const [assessmentStatus, setAssessmentStatus] = useState({
    aptitude: { unlocked: true, completed: false, started: false },
    coding: { unlocked: false, completed: false, started: false },
    interview: { unlocked: false, completed: false, started: false },
  });

  // Function to handle starting an assessment
  const startAssessment = (type) => {
    const newStatus = { ...assessmentStatus };
    newStatus[type].started = true;
    setAssessmentStatus(newStatus);
  };

  // Function to handle completing an assessment
  const completeAssessment = (type) => {
    const newStatus = { ...assessmentStatus };
    newStatus[type].completed = true;

    // Unlock next assessment if applicable
    if (type === "aptitude") {
      newStatus.coding.unlocked = true;
    } else if (type === "coding") {
      newStatus.interview.unlocked = true;
    }

    setAssessmentStatus(newStatus);
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <Navbar />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#031930] to-[#223A59] py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Your Assessment Journey
          </h1>
          <p className="mt-6 text-xl text-[#B3D6F9] max-w-3xl mx-auto">
            Complete all three stages to showcase your skills and get matched
            with your dream job
          </p>
        </div>
      </div>

      {/* Assessment Progress Tracker */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-md p-6 mb-10">
          <h2 className="text-2xl font-bold text-[#031930] mb-6">
            Your Progress
          </h2>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#D1DDED] -translate-y-1/2"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-[#3684DB] -translate-y-1/2"
              style={{
                width: `${
                  (assessmentStatus.aptitude.completed ? 33.33 : 0) +
                  (assessmentStatus.coding.completed ? 33.33 : 0) +
                  (assessmentStatus.interview.completed ? 33.33 : 0)
                }%`,
              }}
            ></div>
            <div className="relative flex justify-between">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                    assessmentStatus.aptitude.completed
                      ? "bg-[#3684DB] text-white"
                      : assessmentStatus.aptitude.started
                      ? "bg-[#F0F9FF] border-2 border-[#3684DB] text-[#3684DB]"
                      : "bg-[#F0F9FF] border-2 border-[#3684DB] text-[#3684DB]"
                  }`}
                >
                  {assessmentStatus.aptitude.completed ? (
                    <CheckCircle size={20} />
                  ) : (
                    1
                  )}
                </div>
                <span className="text-sm font-medium text-[#223A59] mt-2">
                  Aptitude Test
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                    assessmentStatus.coding.completed
                      ? "bg-[#3684DB] text-white"
                      : assessmentStatus.coding.started
                      ? "bg-[#F0F9FF] border-2 border-[#3684DB] text-[#3684DB]"
                      : assessmentStatus.coding.unlocked
                      ? "bg-[#F0F9FF] border-2 border-[#3684DB] text-[#3684DB]"
                      : "bg-[#D1DDED] text-[#758BA5]"
                  }`}
                >
                  {assessmentStatus.coding.completed ? (
                    <CheckCircle size={20} />
                  ) : (
                    2
                  )}
                </div>
                <span className="text-sm font-medium text-[#223A59] mt-2">
                  Coding Challenge
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                    assessmentStatus.interview.completed
                      ? "bg-[#3684DB] text-white"
                      : assessmentStatus.interview.started
                      ? "bg-[#F0F9FF] border-2 border-[#3684DB] text-[#3684DB]"
                      : assessmentStatus.interview.unlocked
                      ? "bg-[#F0F9FF] border-2 border-[#3684DB] text-[#3684DB]"
                      : "bg-[#D1DDED] text-[#758BA5]"
                  }`}
                >
                  {assessmentStatus.interview.completed ? (
                    <CheckCircle size={20} />
                  ) : (
                    3
                  )}
                </div>
                <span className="text-sm font-medium text-[#223A59] mt-2">
                  AI Interview
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Aptitude Assessment Card */}
          <div className="bg-white rounded-xl shadow-md border border-[#D1DDED] overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="h-2 bg-[#3684DB]"></div>
            <div className="p-6">
              <div className="w-14 h-14 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-[#3684DB]" />
              </div>
              <h3 className="text-xl font-semibold text-[#223A59] mb-2">
                Aptitude Assessment
              </h3>
              <p className="text-[#758BA5] mb-6">
                Evaluate your reasoning, problem-solving, and analytical skills
                with our comprehensive aptitude test.
              </p>
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-[#758BA5] mr-2" />
                <span className="text-sm text-[#758BA5]">45 minutes</span>
              </div>
              <div className="border-t border-[#D1DDED] pt-4 mt-auto">
                {assessmentStatus.aptitude.completed ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Completed</span>
                  </div>
                ) : assessmentStatus.aptitude.started ? (
                  <button
                    onClick={() => completeAssessment("aptitude")}
                    className="w-full py-3 bg-[#3684DB] text-white rounded-lg hover:bg-[#2D6FC0] transition-all duration-300 flex items-center justify-center"
                  >
                    Continue Assessment
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => startAssessment("aptitude")}
                    className="w-full py-3 bg-[#3684DB] text-white rounded-lg hover:bg-[#2D6FC0] transition-all duration-300 flex items-center justify-center"
                  >
                    Start Assessment
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Coding Challenge Card */}
          <div
            className={`bg-white rounded-xl shadow-md border border-[#D1DDED] overflow-hidden transition-all duration-300 ${
              assessmentStatus.coding.unlocked
                ? "hover:shadow-lg"
                : "opacity-75"
            }`}
          >
            <div className="h-2 bg-[#3684DB]"></div>
            <div className="p-6">
              <div className="w-14 h-14 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-4">
                <Code className="w-8 h-8 text-[#3684DB]" />
              </div>
              <h3 className="text-xl font-semibold text-[#223A59] mb-2">
                Coding Challenge
              </h3>
              <p className="text-[#758BA5] mb-6">
                Demonstrate your technical skills with real-world coding
                problems in your preferred language.
              </p>
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-[#758BA5] mr-2" />
                <span className="text-sm text-[#758BA5]">60 minutes</span>
              </div>
              <div className="border-t border-[#D1DDED] pt-4 mt-auto">
                {!assessmentStatus.coding.unlocked ? (
                  <div className="flex items-center text-[#758BA5]">
                    <Lock className="w-5 h-5 mr-2" />
                    <span>Complete Aptitude Test to unlock</span>
                  </div>
                ) : assessmentStatus.coding.completed ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Completed</span>
                  </div>
                ) : assessmentStatus.coding.started ? (
                  <button
                    onClick={() => completeAssessment("coding")}
                    className="w-full py-3 bg-[#3684DB] text-white rounded-lg hover:bg-[#2D6FC0] transition-all duration-300 flex items-center justify-center"
                  >
                    Continue Challenge
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => startAssessment("coding")}
                    className="w-full py-3 bg-[#3684DB] text-white rounded-lg hover:bg-[#2D6FC0] transition-all duration-300 flex items-center justify-center"
                  >
                    Start Challenge
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* AI Interview Card */}
          <div
            className={`bg-white rounded-xl shadow-md border border-[#D1DDED] overflow-hidden transition-all duration-300 ${
              assessmentStatus.interview.unlocked
                ? "hover:shadow-lg"
                : "opacity-75"
            }`}
          >
            <div className="h-2 bg-[#3684DB]"></div>
            <div className="p-6">
              <div className="w-14 h-14 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-[#3684DB]" />
              </div>
              <h3 className="text-xl font-semibold text-[#223A59] mb-2">
                AI Interview
              </h3>
              <p className="text-[#758BA5] mb-6">
                Practice with our AI interviewer to improve your communication
                skills and interview confidence.
              </p>
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-[#758BA5] mr-2" />
                <span className="text-sm text-[#758BA5]">30 minutes</span>
              </div>
              <div className="border-t border-[#D1DDED] pt-4 mt-auto">
                {!assessmentStatus.interview.unlocked ? (
                  <div className="flex items-center text-[#758BA5]">
                    <Lock className="w-5 h-5 mr-2" />
                    <span>Complete Coding Challenge to unlock</span>
                  </div>
                ) : assessmentStatus.interview.completed ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Completed</span>
                  </div>
                ) : assessmentStatus.interview.started ? (
                  <button
                    onClick={() => completeAssessment("interview")}
                    className="w-full py-3 bg-[#3684DB] text-white rounded-lg hover:bg-[#2D6FC0] transition-all duration-300 flex items-center justify-center"
                  >
                    Continue Interview
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => startAssessment("interview")}
                    className="w-full py-3 bg-[#3684DB] text-white rounded-lg hover:bg-[#2D6FC0] transition-all duration-300 flex items-center justify-center"
                  >
                    Start Interview
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-md p-8 border border-[#D1DDED]">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-[#3684DB] mr-4 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-[#223A59] mb-2">
                Assessment Information
              </h3>
              <p className="text-[#758BA5] mb-4">
                Complete all three assessment stages to receive your
                comprehensive skill report. Each assessment must be completed in
                sequence.
              </p>
              <ul className="list-disc list-inside text-[#758BA5] space-y-2 pl-4">
                <li>You can pause and resume assessments at any time</li>
                <li>Results are saved automatically as you progress</li>
                <li>
                  Your final report will be available immediately upon
                  completion
                </li>
                <li>
                  You&apos;ll receive personalized job matches based on your
                  performance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {assessmentStatus.interview.completed && (
        <div className="bg-gradient-to-r from-[#223A59] to-[#3684DB] text-white py-12 px-4 mt-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold">
              Congratulations on Completing All Assessments!
            </h2>
            <p className="mt-4 text-xl max-w-3xl mx-auto">
              Your comprehensive report is ready. View your results and explore
              job matches that align with your skills.
            </p>
            <div className="mt-8">
              <Link
                href="/results"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-[#3684DB] rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                View Your Results
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Simple version */}
      <footer className="bg-[#031930] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#B3D6F9]">
            © 2025 HireTrack. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
