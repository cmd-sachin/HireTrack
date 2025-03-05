"use client";

import React, { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Code,
  Play,
  CheckCircle2,
  XCircle,
  BookOpen,
  ListChecks,
} from "lucide-react";

// Dynamically import CodeMirror for client-side rendering
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});
import { javascript } from "@codemirror/lang-javascript";
import { githubLight } from "@uiw/codemirror-theme-github"; // light theme

// Problem definition
const PROBLEM = {
  id: "two-sum-001",
  title: "Two Sum",
  difficulty: "Medium",
  tags: ["Array", "Hash Table"],
  description: `
Given an array of integers nums and an integer target, return indices of the two numbers 
such that they add up to target. You may assume that each input would have exactly one 
solution, and you may not use the same element twice. You can return the answer in any order.
  `,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists",
  ],
};

// Hidden test cases
const HIDDEN_TEST_CASES = [
  {
    id: "hidden-1",
    input: "[3,2,4]\n6",
    expectedOutput: "[1,2]",
    description: "Basic case with non-consecutive indices",
  },
  {
    id: "hidden-2",
    input: "[3,3]\n6",
    expectedOutput: "[0,1]",
    description: "Case with duplicate numbers",
  },
  {
    id: "hidden-3",
    input: "[-1,-2,-3,4,5]\n2",
    expectedOutput: "[3,4]",
    description: "Case with negative and positive numbers",
  },
  {
    id: "hidden-4",
    input: "[100,200,300,400]\n700",
    expectedOutput: "[2,3]",
    description: "Large number case",
  },
  {
    id: "hidden-5",
    input: "[1,5,3,8,2]\n11",
    expectedOutput: "[2,3]",
    description: "Complex array with multiple possible solutions",
  },
];

export default function CodingRoundPage() {
  // State management
  const [code, setCode] = useState(`
function twoSum(nums, target) {
  // Implement your solution here
  // Hint: Consider using a hash map for O(n) time complexity
}
`);
  const [testResults, setTestResults] = useState({
    sampleTestsPassed: null,
    hiddenTestResults: [],
    overallResult: null,
    executionError: null,
  });
  const [activeTab, setActiveTab] = useState("problem");

  // Handler to run code
  const handleRunCode = useCallback(() => {
    if (!code.trim() || code.includes("Implement your solution here")) {
      setTestResults({
        sampleTestsPassed: null,
        hiddenTestResults: [],
        overallResult: false,
        executionError: "Please implement your solution before running tests.",
      });
      return;
    }

    try {
      setTestResults({
        sampleTestsPassed: null,
        hiddenTestResults: [],
        overallResult: null,
        executionError: null,
      });

      const executeUserFunction = (func, nums, target) => {
        if (!Array.isArray(nums) || typeof target !== "number") {
          throw new Error("Invalid input types");
        }
        const result = func(nums, target);
        if (!Array.isArray(result) || result.length !== 2) {
          throw new Error("Invalid output format");
        }
        return result;
      };

      const userFunction = new Function(`"use strict"; return (${code});`)();

      const sampleTestResults = PROBLEM.examples.map((example) => {
        const [numsStr, targetStr] = example.input.split(", target = ");
        const nums = JSON.parse(numsStr.split("nums = ")[1]);
        const target = JSON.parse(targetStr);
        try {
          const result = executeUserFunction(userFunction, nums, target);
          return {
            passed: JSON.stringify(result) === example.output,
            input: example.input,
            output: result,
          };
        } catch (err) {
          return {
            passed: false,
            input: example.input,
            error: err.message,
          };
        }
      });

      const hiddenTestResults = HIDDEN_TEST_CASES.map((testCase) => {
        const [numsStr, targetStr] = testCase.input.split("\n");
        const nums = JSON.parse(numsStr);
        const target = JSON.parse(targetStr);
        try {
          const result = executeUserFunction(userFunction, nums, target);
          return {
            id: testCase.id,
            passed: JSON.stringify(result) === testCase.expectedOutput,
            description: testCase.description,
            input: testCase.input,
          };
        } catch (err) {
          return {
            id: testCase.id,
            passed: false,
            description: testCase.description,
            error: err.message,
          };
        }
      });

      const overallResult =
        sampleTestResults.every((test) => test.passed) &&
        hiddenTestResults.every((test) => test.passed);

      setTestResults({
        sampleTestsPassed,
        hiddenTestResults,
        overallResult,
        executionError: null,
      });
    } catch (error) {
      setTestResults({
        sampleTestsPassed: null,
        hiddenTestResults: [],
        overallResult: false,
        executionError: error.message,
      });
    }
  }, [code]);

  const handleSubmit = useCallback(() => {
    // For now, we reuse the same handler as run code.
    handleRunCode();
  }, [handleRunCode]);

  // Use a blue tone for Medium difficulty
  const difficultyColor = useMemo(() => {
    switch (PROBLEM.difficulty) {
      case "Easy":
        return "bg-green-500";
      case "Medium":
        return "bg-blue-500";
      case "Hard":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  }, [PROBLEM.difficulty]);

  return (
    <div className="min-h-screen bg-[#F5F9FF] text-[#031930]">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#031930] to-[#223A59] py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Coding Challenge
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#D0E6FF] max-w-2xl mx-auto">
            Solve the problem below and launch your assessment.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Left Side - Problem Details & Test Cases */}
        <section className="w-full md:w-1/2">
          <div className="bg-white shadow rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">{PROBLEM.title}</h2>
              <span
                className={`${difficultyColor} text-white py-1 px-3 rounded-full text-base`}
              >
                {PROBLEM.difficulty}
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-base text-gray-700 whitespace-pre-line">
                {PROBLEM.description.trim()}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Examples</h3>
              {PROBLEM.examples.map((example, idx) => (
                <div
                  key={idx}
                  className="border border-gray-300 rounded-lg p-4 mb-4"
                >
                  <p className="text-base">
                    <strong>Input:</strong> {example.input}
                  </p>
                  <p className="text-base">
                    <strong>Output:</strong> {example.output}
                  </p>
                  <p className="text-base text-gray-600">
                    <strong>Explanation:</strong> {example.explanation}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Constraints</h3>
              <ul className="list-disc pl-5 text-base text-gray-700">
                {PROBLEM.constraints.map((constraint, idx) => (
                  <li key={idx}>{constraint}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Right Side - Code Editor */}
        <section className="w-full md:w-1/2">
          <div className="bg-white shadow rounded-xl p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Code className="w-6 h-6" />
                <h3 className="text-xl font-semibold">Code Editor</h3>
              </div>
            </div>
            {/* Run and Submit Buttons placed above the CodeMirror */}
            <div className="mb-4 flex justify-end gap-2">
              <button
                onClick={handleRunCode}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-300 shadow"
              >
                <Play className="w-4 h-4 mr-1" />
                Run
              </button>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold bg-green-500 text-white rounded hover:bg-green-600 transition-all duration-300 shadow"
              >
                Submit
              </button>
            </div>
            <div className="flex-1">
              <CodeMirror
                value={code}
                height="calc(100vh - 350px)"
                theme={githubLight}
                extensions={[javascript()]}
                onChange={(value) => setCode(value)}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
