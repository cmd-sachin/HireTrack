"use client";

import {
  Brain,
  Code,
  Users,
  Lock,
  CheckCircle,
  ArrowRight,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import Navbar from "../components/NavBar";
import { useRouter } from "next/navigation";
import useAssessmentStore from "../store/assessmentStore"; 

export default function Assessment() {
  const router = useRouter();
  const { assessmentStatus } = useAssessmentStore();
  const [loading, setLoading] = useState(null); 

  const startAssessment = (type) => {
    setLoading(type);
    router.push(`/hire/${type}`);
  };

  // Helper to compute progress bar width
  const calculateProgress = () => {
    const completed = Object.values(assessmentStatus).filter(
      (round) => round.completed
    ).length;
    return (completed / 3) * 100;
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <Navbar />

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

      {/* Progress Tracker */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-md p-6 mb-10">
          <h2 className="text-2xl font-bold text-[#031930] mb-6">
            Your Progress
          </h2>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#D1DDED] -translate-y-1/2"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-[#3684DB] -translate-y-1/2"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
            <div className="relative flex justify-between">
              {["aptitude", "coding", "interview"].map((round, index) => {
                const { unlocked, completed } = assessmentStatus[round];
                return (
                  <div key={round} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        completed
                          ? "bg-[#3684DB] text-white"
                          : unlocked
                          ? "bg-[#F0F9FF] border-2 border-[#3684DB] text-[#3684DB]"
                          : "bg-[#D1DDED] text-[#758BA5]"
                      }`}
                    >
                      {completed ? <CheckCircle size={20} /> : index + 1}
                    </div>
                    <span className="text-sm font-medium text-[#223A59] mt-2">
                      {round.charAt(0).toUpperCase() + round.slice(1)} Test
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Assessment Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {["aptitude", "coding", "interview"].map((round, index) => {
            const { unlocked, completed } = assessmentStatus[round];
            const Icon =
              round === "aptitude" ? Brain : round === "coding" ? Code : Users;
            const duration =
              round === "aptitude"
                ? "45 minutes"
                : round === "coding"
                ? "60 minutes"
                : "30 minutes";

            return (
              <div
                key={round}
                className={`bg-white rounded-xl shadow-md border border-[#D1DDED] overflow-hidden transition-all duration-300 ${
                  unlocked ? "hover:shadow-lg" : "opacity-75"
                }`}
              >
                <div className="h-2 bg-[#3684DB]"></div>
                <div className="p-6">
                  <div className="w-14 h-14 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-[#3684DB]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#223A59] mb-2">
                    {round.charAt(0).toUpperCase() + round.slice(1)} Assessment
                  </h3>
                  <p className="text-[#758BA5] mb-6">
                    {round === "aptitude"
                      ? "Evaluate your reasoning and analytical skills."
                      : round === "coding"
                      ? "Showcase your coding abilities."
                      : "Prepare for real interviews."}
                  </p>
                  <div className="flex items-center mb-4">
                    <Clock className="w-5 h-5 text-[#758BA5] mr-2" />
                    <span className="text-sm text-[#758BA5]">{duration}</span>
                  </div>
                  <div className="border-t border-[#D1DDED] pt-4 mt-auto">
                    {completed ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span>Completed</span>
                      </div>
                    ) : !unlocked ? (
                      <div className="flex items-center text-[#758BA5]">
                        <Lock className="w-5 h-5 mr-2" />
                        <span>Complete previous test to unlock</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => startAssessment(round)}
                        disabled={loading === round}
                        className="w-full py-3 bg-[#3684DB] text-white rounded-lg hover:bg-[#2D6FC0] transition-all duration-300 flex items-center justify-center"
                      >
                        {loading === round ? (
                          <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        ) : (
                          "Start"
                        )}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
