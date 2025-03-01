"use client";
import { Lock, Unlock, Brain, Code, Users } from "lucide-react";
import Navbar from "./../components/NavBar";
import { useState } from "react";

export default function AssessmentPage() {
  const [completed, setCompleted] = useState({
    aptitude: false,
    coding: false,
  });

  const handleComplete = (round) => {
    if (round !== "aptitude" && round !== "coding") {
      console.error("Invalid round:", round);
      return;
    }
    setCompleted((prev) => ({ ...prev, [round]: true }));
  };

  const rounds = [
    {
      id: "aptitude",
      title: "Aptitude Test",
      description: "Evaluate your problem-solving and logical thinking skills.",
      icon: <Brain className="w-10 h-10 text-[#3684DB]" />,
      unlocked: true,
      completed: completed.aptitude,
    },
    {
      id: "coding",
      title: "Coding Round",
      description:
        "Solve real-world coding challenges with practical solutions.",
      icon: <Code className="w-10 h-10 text-[#3684DB]" />,
      unlocked: completed.aptitude,
      completed: completed.coding,
    },
    {
      id: "interview",
      title: "AI HR Interview",
      description: "Experience an AI-powered HR interview simulation.",
      icon: <Users className="w-10 h-10 text-[#3684DB]" />,
      unlocked: completed.coding,
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="py-16 px-4 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#031930] text-center mb-6">
          Complete Your Assessment Journey
        </h1>
        <p className="text-center text-[#758BA5] max-w-3xl mx-auto">
          Progress through each stage, unlocking the next after successful
          completion.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {rounds.map((round, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 shadow-md border ${
                round.unlocked
                  ? "border-[#3684DB] bg-[#F5F9FF]"
                  : "border-[#D1DDED] bg-gray-100"
              } transition-all`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow">
                  {round.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#031930]">
                  {round.title}
                </h3>
              </div>
              <p className="mt-4 text-[#758BA5]">{round.description}</p>

              <div className="mt-6">
                {round.completed ? (
                  <span className="inline-flex items-center px-4 py-2 bg-[#DFF0D8] text-[#3C763D] text-sm font-medium rounded-lg">
                    Completed
                  </span>
                ) : round.unlocked ? (
                  <button
                    onClick={() =>
                      round.id === "aptitude"
                        ? handleComplete("aptitude")
                        : handleComplete("coding")
                    }
                    className="w-full bg-[#3684DB] hover:bg-[#2D6FC0] text-white font-medium py-3 rounded-lg transition-all"
                  >
                    Start {round.title}
                  </button>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-[#A1B2C6]">
                    <Lock className="w-5 h-5" />
                    <span className="font-medium text-sm">Locked</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
