"use client";

import React, { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardBody,
  Tabs,
  Tab,
  Chip,
  ScrollShadow,
} from "@nextui-org/react";
import {
  Code,
  Play,
  CheckCircle2,
  XCircle,
  BookOpen,
  ListChecks,
} from "lucide-react";

// Dynamically import CodeMirror to ensure client-side rendering
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";

// Comprehensive problem definition with detailed metadata
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

// Comprehensive hidden test cases with diverse scenarios
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

  // Run Code handler with error management and validations
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

      // Create the function from user's code
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
        sampleTestsPassed: sampleTestResults,
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

  // Memoized difficulty color matching HireTrack theme
  const difficultyColor = useMemo(() => {
    switch (PROBLEM.difficulty) {
      case "Easy":
        return "bg-green-500";
      case "Medium":
        return "bg-[#3684DB]";
      case "Hard":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  }, [PROBLEM.difficulty]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar (reuse your HireTrack Navbar) */}
      <div className="mb-8">
        {/* Replace with your Navbar component */}
        <Link href="/" className="text-2xl font-bold text-[#031930] px-4 py-2">
          HireTrack
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Left Section - Problem Details */}
        <div className="w-full md:w-2/5 border-r border-[#D1DDED] pr-4">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#031930]">
                {PROBLEM.title}
              </h2>
              <span
                className={`${difficultyColor} text-white py-1 px-3 rounded-full text-sm`}
              >
                {PROBLEM.difficulty}
              </span>
            </div>
            <Tabs
              variant="underlined"
              selectedKey={activeTab}
              onSelectionChange={setActiveTab}
              color="primary"
            >
              <Tab
                key="problem"
                title={
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-[#3684DB]" />
                    <span className="font-semibold text-[#031930]">
                      Problem
                    </span>
                  </div>
                }
              >
                <ScrollShadow className="h-[400px] pr-4">
                  <p className="mb-4 text-[#758BA5]">{PROBLEM.description}</p>
                  <h3 className="font-bold text-[#031930] mb-2">Examples</h3>
                  {PROBLEM.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#D1DDED] rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <p className="text-sm text-[#031930]">
                        <strong>Input:</strong> {example.input}
                      </p>
                      <p className="text-sm text-[#031930]">
                        <strong>Output:</strong> {example.output}
                      </p>
                      <p className="text-sm text-[#758BA5]">
                        <strong>Explanation:</strong> {example.explanation}
                      </p>
                    </div>
                  ))}
                  <h3 className="font-bold text-[#031930] mb-2">Constraints</h3>
                  <ul className="list-disc pl-5 text-[#758BA5]">
                    {PROBLEM.constraints.map((constraint, idx) => (
                      <li key={idx}>{constraint}</li>
                    ))}
                  </ul>
                </ScrollShadow>
              </Tab>

              <Tab
                key="results"
                title={
                  <div className="flex items-center space-x-2">
                    <ListChecks className="w-5 h-5 text-[#3684DB]" />
                    <span className="font-semibold text-[#031930]">
                      Results
                    </span>
                  </div>
                }
              >
                <div className="mt-4">
                  {testResults.executionError && (
                    <p className="text-red-500">{testResults.executionError}</p>
                  )}
                  {testResults.sampleTestsPassed && (
                    <div className="space-y-4">
                      <div className="mb-4">
                        <h4 className="font-bold text-[#031930] mb-2">
                          Sample Tests
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {testResults.sampleTestsPassed.map((test, idx) => (
                            <div
                              key={idx}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm shadow ${
                                test.passed
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {test.passed ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              <span>Test {idx + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-[#031930] mb-2">
                          Hidden Tests
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {testResults.hiddenTestResults.map((test) => (
                            <div
                              key={test.id}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm shadow ${
                                test.passed
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {test.passed ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              <span>{test.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>

        {/* Right Section - Code Editor */}
        <div className="w-full md:w-3/5">
          <div className="bg-white shadow-lg rounded-xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Code className="w-6 h-6 text-[#031930]" />
                <h3 className="text-xl font-semibold text-[#031930]">
                  Code Editor
                </h3>
              </div>
              <button
                onClick={handleRunCode}
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold bg-[#3684DB] text-white rounded-lg hover:bg-[#2D6FC0] transition-all duration-300 shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Run Code
              </button>
            </div>
            <div className="flex-1">
              <CodeMirror
                value={code}
                height="calc(100vh - 300px)"
                theme={dracula}
                extensions={[javascript()]}
                onChange={(value) => setCode(value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
