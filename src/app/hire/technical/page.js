"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Code, Play, Lock, ChevronLeft, ChevronRight } from "lucide-react";

// Dynamically import CodeMirror for client-side rendering
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { githubLight } from "@uiw/codemirror-theme-github";

const parseValue = (str) => {
  try {
    str = str.trim();
    if (str.includes("=")) {
      const match = str.match(/=\s*(.+)$/);
      if (match && match[1]) {
        str = match[1].trim();
      }
    }

    if (str.startsWith("{")) {
      const lastBrace = str.lastIndexOf("}");
      if (lastBrace !== -1) {
        str = str.substring(0, lastBrace + 1);
      }
    } else if (str.startsWith("[")) {
      const lastBracket = str.lastIndexOf("]");
      if (lastBracket !== -1) {
        str = str.substring(0, lastBracket + 1);
      }
    }
    return JSON.parse(str);
  } catch (error) {
    console.error("Error parsing value:", error, "Input:", str);
    return str;
  }
};

export default function CodingRoundPage() {
  const defaultCode = {
    javascript: `function twoSum(nums, target) {
  // Implement your solution here
  // Hint: Consider using a hash map for O(n) time complexity
}`,
    python: `def two_sum(nums, target):
    # Implement your solution here
    # Hint: Consider using a dictionary for O(n) time complexity
    pass`,
    java: `public int[] twoSum(int[] nums, int target) {
    // Implement your solution here
    // Hint: Consider using a HashMap for O(n) time complexity
    return new int[]{};
}`,
    "c++": `vector<int> twoSum(vector<int>& nums, int target) {
    // Implement your solution here
    // Hint: Consider using an unordered_map for O(n) time complexity
    return {};
}`,
  };

  // Code editor state
  const [code, setCode] = useState(defaultCode.javascript);
  // Store array of problems from the API
  const [problems, setProblems] = useState([]);
  // Track current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // States for test results and error handling
  const [testResults, setTestResults] = useState({
    sampleTestsPassed: null,
    overallResult: null,
    executionError: null,
  });
  // Language selection state
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  // Determine language extension for CodeMirror based on selection
  const languageExtension = useMemo(() => {
    switch (selectedLanguage) {
      case "python":
        return python();
      case "java":
        return java();
      case "c++":
        return cpp();
      default:
        return javascript();
    }
  }, [selectedLanguage]);

  // Update the code snippet when the language changes.
  useEffect(() => {
    setCode(defaultCode[selectedLanguage]);
  }, [selectedLanguage]);

  // Fetch dynamic questions (an array) from the API on component mount
  const fetchDynamicQuestions = useCallback(async () => {
    try {
      const messages = [
        { role: "user", content: "Give me a technical coding challenge." },
      ];
      const response = await fetch("/api/questionGeneration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: "technical", messages }),
      });
      const data = await response.json();
      // Expect data to be an array of question objects
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(
          "Invalid question data received from API: " + JSON.stringify(data)
        );
      }
      // Map each dynamic response to the structure used in the UI.
      const mappedProblems = data.map((q) => {
        const sampleInput = JSON.stringify(parseValue(q.sampleTestCase.input));
        const sampleOutput = JSON.stringify(
          parseValue(q.sampleTestCase.output)
        );
        return {
          id: q.id || "dynamic-question",
          title: q.questionHeader || "Dynamic Coding Challenge",
          description: q.question,
          examples: [
            {
              input: sampleInput,
              output: sampleOutput,
              explanation: q.sampleTestCase.explanation,
            },
          ],
          constraints: q.inputConstraints || [],
          testCases: q.testCases
            ? q.testCases.map((tc) => ({
                input: JSON.stringify(parseValue(tc.input)),
                output: JSON.stringify(parseValue(tc.output)),
              }))
            : [],
        };
      });
      setProblems(mappedProblems);
      setCurrentQuestionIndex(0);
      console.log("Dynamic questions loaded:", mappedProblems);
    } catch (err) {
      console.error("Error fetching dynamic questions:", err);
    }
  }, []);

  useEffect(() => {
    fetchDynamicQuestions();
  }, [fetchDynamicQuestions]);

  // Get current problem from the problems array
  const currentProblem = problems[currentQuestionIndex];

  // Handler to run tests (only works for JavaScript code execution)
  const handleRunCode = useCallback(() => {
    if (selectedLanguage !== "javascript") {
      setTestResults({
        sampleTestsPassed: null,
        overallResult: false,
        executionError:
          "Code execution is currently supported only for JavaScript in demo mode.",
      });
      return;
    }
    if (!code.trim() || code.includes("Implement your solution here")) {
      setTestResults({
        sampleTestsPassed: null,
        overallResult: false,
        executionError: "Please implement your solution before running tests.",
      });
      return;
    }
    try {
      setTestResults({
        sampleTestsPassed: null,
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

      // Use the sample test case provided from the current problem
      const examples = currentProblem?.examples || [];
      const sampleTestResults = examples.map((example) => {
        try {
          let nums, target;
          const parsed = parseValue(example.input);
          if (Array.isArray(parsed)) {
            [nums, target] = parsed;
          } else {
            throw new Error("Parsed input is not an array");
          }
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

      const overallResult = sampleTestResults.every((test) => test.passed);

      setTestResults({
        sampleTestsPassed: sampleTestResults,
        overallResult,
        executionError: null,
      });
    } catch (error) {
      setTestResults({
        sampleTestsPassed: null,
        overallResult: false,
        executionError: error.message,
      });
    }
  }, [code, selectedLanguage, currentProblem]);

  // Handler for submission (here we reuse run tests logic)
  const handleSubmit = useCallback(() => {
    // In a real application, submission logic would go here.
    // For now, we'll simply run the tests.
    handleRunCode();
  }, [handleRunCode]);

  // Handlers for navigation
  const handlePreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) =>
      prev < problems.length - 1 ? prev + 1 : prev
    );
  }, [problems.length]);

  return (
    <div className="min-h-screen bg-[#F5F9FF] text-[#031930]">
      {/* Static Header */}
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
        {/* Left Side - Current Problem Details with Navigation */}
        <section className="w-full md:w-1/2">
          <div className="bg-white shadow rounded-xl p-8">
            {currentProblem ? (
              <>
                {/* Navigation inside the left container */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{currentProblem.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === problems.length - 1}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-base text-gray-700 whitespace-pre-line mb-6">
                  {currentProblem.description}
                </p>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">Example</h4>
                  {currentProblem.examples.map((example, idx) => (
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
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">Constraints</h4>
                  <ul className="list-disc pl-5 text-base text-gray-700">
                    {currentProblem.constraints.map((constraint, idx) => (
                      <li key={idx}>{constraint}</li>
                    ))}
                  </ul>
                </div>
                {currentProblem.testCases &&
                  currentProblem.testCases.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        Locked Test Cases
                      </h4>
                      <ul className="space-y-2">
                        {currentProblem.testCases.map((testCase, idx) => (
                          <li
                            key={idx}
                            className="flex items-center space-x-2 border border-gray-300 rounded-lg p-3"
                          >
                            <Lock className="w-4 h-4 text-gray-500" />
                            <span className="text-base">
                              Test Case {idx + 1} - Locked
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            ) : (
              <p>Loading challenge details...</p>
            )}
          </div>
        </section>

        {/* Right Side - Code Editor and Controls */}
        <section className="w-full md:w-1/2">
          <div className="bg-white shadow rounded-xl p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Code className="w-6 h-6" />
                <h3 className="text-xl font-semibold">Code Editor</h3>
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c++">C++</option>
              </select>
            </div>
            <div className="mb-4 flex justify-end gap-2">
              <button
                onClick={handleRunCode}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-300 shadow"
              >
                <Play className="w-4 h-4 mr-1" />
                Run Tests
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
                height="calc(100vh - 450px)"
                theme={githubLight}
                extensions={[languageExtension]}
                onChange={(value) => setCode(value)}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Display test results/errors */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {testResults.executionError && (
          <div className="text-red-600">{testResults.executionError}</div>
        )}
        {testResults.overallResult !== null && (
          <div
            className={
              testResults.overallResult ? "text-green-600" : "text-red-600"
            }
          >
            {testResults.overallResult
              ? "All tests passed!"
              : "Some tests failed."}
          </div>
        )}
      </div>
    </div>
  );
}
