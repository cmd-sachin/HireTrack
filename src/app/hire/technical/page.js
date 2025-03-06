"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Terminal,
  FileText,
  Code,
} from "lucide-react";

// Dynamically import CodeMirror for client-side rendering
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";

// Helper function to find the index of the matching closing bracket/brace
function findMatchingBracketIndex(str, startIndex) {
  const open = str[startIndex];
  let close;
  if (open === "[") {
    close = "]";
  } else if (open === "{") {
    close = "}";
  } else {
    return -1;
  }
  let count = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === open) {
      count++;
    } else if (str[i] === close) {
      count--;
      if (count === 0) return i;
    }
  }
  return -1;
}

// Updated parseValue function to handle extra characters after valid JSON
const parseValue = (str) => {
  try {
    if (!str) return str;
    str = str.trim();
    // Only try to parse if the string starts with a JSON token.
    if (!(str.startsWith("{") || str.startsWith("["))) {
      return str;
    }
    // For arrays: attempt to split into two parts if extra content is present.
    if (str.startsWith("[")) {
      const closingIndex = findMatchingBracketIndex(str, 0);
      if (closingIndex === -1)
        throw new Error("No matching closing bracket found.");
      if (closingIndex < str.length - 1) {
        const firstPart = str.substring(0, closingIndex + 1);
        let remainder = str.substring(closingIndex + 1).trim();
        if (remainder.startsWith(",")) {
          remainder = remainder.substring(1).trim();
        }
        return [JSON.parse(firstPart), JSON.parse(remainder)];
      }
      return JSON.parse(str);
    }
    // For objects: similar logic as above.
    if (str.startsWith("{")) {
      const closingIndex = findMatchingBracketIndex(str, 0);
      if (closingIndex === -1)
        throw new Error("No matching closing brace found.");
      if (closingIndex < str.length - 1) {
        const firstPart = str.substring(0, closingIndex + 1);
        let remainder = str.substring(closingIndex + 1).trim();
        if (remainder.startsWith(",")) {
          remainder = remainder.substring(1).trim();
        }
        return [JSON.parse(firstPart), JSON.parse(remainder)];
      }
      return JSON.parse(str);
    }
  } catch (error) {
    console.error("Error parsing value:", error, "Input:", str);
    return str;
  }
};

export default function CodingRoundPage() {
  // Remove default starter code; we'll load it from the questionGeneration API
  const [code, setCode] = useState("");
  const [problems, setProblems] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResults, setTestResults] = useState({
    sampleTestsPassed: null,
    testCaseResults: [],
    overallResult: null,
    executionError: null,
  });
  // Language options now: javascript, python, java, and c
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("problem");
  const [executionOutput, setExecutionOutput] = useState("");
  const [executionTime, setExecutionTime] = useState(null);
  const [customInput, setCustomInput] = useState("");

  // Determine CodeMirror language extension (for syntax highlighting)
  const languageExtension = useMemo(() => {
    switch (selectedLanguage) {
      case "python":
        return python();
      case "java":
        return java();
      case "c":
        return cpp(); // using the cpp extension for C; adjust if needed
      default:
        return javascript();
    }
  }, [selectedLanguage]);

  // Fetch dynamic questions from the questionGeneration API
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
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(
          "Invalid question data received from API: " + JSON.stringify(data)
        );
      }
      // Map each API response to our UI structure
      const mappedProblems = data.map((q) => {
        const sampleInput = JSON.stringify(parseValue(q.sampleTestCase.input));
        const sampleOutput = JSON.stringify(
          parseValue(q.sampleTestCase.output)
        );
        return {
          id: q.id || "dynamic-question",
          questionHeader: q.questionHeader,
          description: q.question,
          difficulty: q.difficulty || "Medium",
          examples: [
            {
              input: sampleInput,
              output: sampleOutput,
              explanation: q.sampleTestCase.explanation,
            },
          ],
          constraints: q.inputConstraints || [],
          testCases: q.testCases
            ? q.testCases.map((tc, idx) => ({
                id: idx,
                input: JSON.stringify(parseValue(tc.input)),
                output: JSON.stringify(parseValue(tc.output)),
                status: "pending",
                hidden: true, // Mark all test cases as hidden initially
              }))
            : [],
          // starterCode is now an object with keys for each language
          starterCode: q.starterCode,
        };
      });
      setProblems(mappedProblems);
      setCurrentQuestionIndex(0);
      // Set initial code from the first problem's starter code for the selected language
      if (mappedProblems.length > 0 && mappedProblems[0].starterCode) {
        setCode(mappedProblems[0].starterCode[selectedLanguage]);
      }
    } catch (err) {
      console.error("Error fetching dynamic questions:", err);
      // Fallback problem if API fails

      setProblems(fallbackProblems);
      setCurrentQuestionIndex(0);
      setCode(fallbackProblems[0].starterCode[selectedLanguage]);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    fetchDynamicQuestions();
  }, [fetchDynamicQuestions]);

  // Update code when the current question or language changes
  useEffect(() => {
    if (
      problems.length > 0 &&
      problems[currentQuestionIndex].starterCode &&
      problems[currentQuestionIndex].starterCode[selectedLanguage]
    ) {
      setCode(problems[currentQuestionIndex].starterCode[selectedLanguage]);
    } else {
      setCode("");
    }
  }, [problems, currentQuestionIndex, selectedLanguage]);

  // Reset test results on language change
  useEffect(() => {
    setTestResults({
      sampleTestsPassed: null,
      testCaseResults: [],
      overallResult: null,
      executionError: null,
    });
  }, [selectedLanguage]);

  // Execute code using JDoodle's API via our backend (/api/compiler)
  const executeCode = async (userCode, language, input) => {
    setIsRunning(true);
    try {
      const startTime = performance.now();
      const response = await fetch("/api/compiler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: userCode,
          language,
          stdin: input || "",
        }),
      });
      const data = await response.json();
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
      return {
        success: data.statusCode === 200,
        output: data.output,
        error: data.error || null,
      };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsRunning(false);
    }
  };

  // Handler for running code with custom input
  const handleRunCustomInput = useCallback(async () => {
    if (code.trim() === "") {
      setExecutionOutput("Please write some code before running.");
      return;
    }
    try {
      const result = await executeCode(code, selectedLanguage, customInput);
      setExecutionOutput(result.success ? result.output : result.error);
    } catch (error) {
      setExecutionOutput(`Error: ${error.message}`);
    }
  }, [code, selectedLanguage, customInput]);

  // Handler for running a sample test using JDoodle's API
  const handleRunCode = useCallback(async () => {
    if (
      code.trim() === "" ||
      (code.includes("Implement your solution here") &&
        !code.includes("return"))
    ) {
      setTestResults({
        sampleTestsPassed: null,
        testCaseResults: [],
        overallResult: false,
        executionError: "Please implement your solution before running tests.",
      });
      return;
    }
    try {
      setTestResults({
        sampleTestsPassed: null,
        testCaseResults: [],
        overallResult: null,
        executionError: null,
      });
      if (problems[currentQuestionIndex]?.examples?.length > 0) {
        const example = problems[currentQuestionIndex].examples[0];
        const result = await executeCode(code, selectedLanguage, example.input);
        const sampleTestResults = [
          {
            passed:
              result.success &&
              result.output.trim() === example.output.replace(/"/g, ""),
            input: example.input,
            output: result.success ? result.output : null,
            expectedOutput: example.output,
            error: result.success ? null : result.error,
          },
        ];
        setTestResults((prev) => ({
          ...prev,
          sampleTestsPassed: sampleTestResults,
          overallResult: sampleTestResults.every((test) => test.passed),
        }));
        setExecutionOutput(result.output || "No output");
      }
    } catch (error) {
      setTestResults({
        sampleTestsPassed: null,
        testCaseResults: [],
        overallResult: false,
        executionError: error.message,
      });
    }
  }, [code, selectedLanguage, problems, currentQuestionIndex]);

  // Handler for submitting code (running all test cases)
  const handleSubmit = useCallback(async () => {
    if (
      !problems[currentQuestionIndex]?.testCases ||
      problems[currentQuestionIndex].testCases.length === 0
    ) {
      setTestResults((prev) => ({
        ...prev,
        executionError: "No test cases available for this problem.",
      }));
      return;
    }
    try {
      setIsRunning(true);
      setActiveTab("results");
      let updatedTestCases = [...problems[currentQuestionIndex].testCases].map(
        (tc) => ({
          ...tc,
          status: "running",
        })
      );
      setTestResults((prev) => ({
        ...prev,
        testCaseResults: updatedTestCases,
        executionError: null,
      }));
      const testResultsArr = [];
      for (let i = 0; i < updatedTestCases.length; i++) {
        const testCase = updatedTestCases[i];
        updatedTestCases = updatedTestCases.map((tc, idx) => ({
          ...tc,
          status: idx === i ? "running" : tc.status,
        }));
        setTestResults((prev) => ({
          ...prev,
          testCaseResults: updatedTestCases,
        }));
        const result = await executeCode(
          code,
          selectedLanguage,
          testCase.input
        );
        const passed =
          result.success &&
          result.output.trim() === testCase.output.replace(/"/g, "");
        updatedTestCases = updatedTestCases.map((tc, idx) => ({
          ...tc,
          status: idx === i ? (passed ? "passed" : "failed") : tc.status,
          actualOutput: result.success ? result.output : null,
          error: result.success ? null : result.error,
          hidden: false, // Reveal test case on submission
        }));
        testResultsArr.push({
          ...testCase,
          passed,
          output: result.success ? result.output : null,
          error: result.success ? null : result.error,
          hidden: false,
        });
        setTestResults((prev) => ({
          ...prev,
          testCaseResults: updatedTestCases,
        }));
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const overallResult = testResultsArr.every((test) => test.passed);
      setTestResults((prev) => ({
        ...prev,
        testCaseResults: updatedTestCases,
        overallResult,
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        overallResult: false,
        executionError: error.message,
      }));
    } finally {
      setIsRunning(false);
    }
  }, [code, selectedLanguage, problems, currentQuestionIndex]);

  // Navigation handlers for questions
  const handlePreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setTestResults({
      sampleTestsPassed: null,
      testCaseResults: [],
      overallResult: null,
      executionError: null,
    });
    setActiveTab("problem");
    setCustomInput("");
    setExecutionOutput("");
  }, []);

  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) =>
      prev < problems.length - 1 ? prev + 1 : prev
    );
    setTestResults({
      sampleTestsPassed: null,
      testCaseResults: [],
      overallResult: null,
      executionError: null,
    });
    setActiveTab("problem");
    setCustomInput("");
    setExecutionOutput("");
  }, [problems.length]);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-[#F5F9FF] text-[#031930]"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#031930] to-[#223A59] py-6 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
              CodeCraft
            </h1>
            <p className="mt-1 text-sm md:text-base text-[#D0E6FF]">
              Advanced Coding Assessment Platform
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isDarkMode ? "🌞" : "🌙"}
            </button>
            <div className="hidden md:flex items-center bg-blue-900/30 rounded-lg px-3 py-1.5">
              <span className="text-white mr-2">Problem:</span>
              <span className="text-white font-medium">
                {problems[currentQuestionIndex]?.questionHeader || "Loading..."}
              </span>
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded ${
                  problems[currentQuestionIndex]?.difficulty === "Easy"
                    ? "bg-green-500"
                    : problems[currentQuestionIndex]?.difficulty === "Medium"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                } text-white`}
              >
                {problems[currentQuestionIndex]?.difficulty || "Medium"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section - Problem Details and Test Results */}
          <section
            className={`w-full ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg rounded-xl overflow-hidden flex flex-col`}
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-300">
              <button
                onClick={() => setActiveTab("problem")}
                className={`flex-1 py-3 px-4 font-medium text-center ${
                  activeTab === "problem"
                    ? `${
                        isDarkMode
                          ? "bg-gray-700 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                      } border-b-2 border-blue-500`
                    : `${isDarkMode ? "text-gray-400" : "text-gray-600"}`
                }`}
              >
                <FileText className="inline-block w-4 h-4 mr-2" />
                Problem
              </button>
              <button
                onClick={() => setActiveTab("results")}
                className={`flex-1 py-3 px-4 font-medium text-center ${
                  activeTab === "results"
                    ? `${
                        isDarkMode
                          ? "bg-gray-700 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                      } border-b-2 border-blue-500`
                    : `${isDarkMode ? "text-gray-400" : "text-gray-600"}`
                }`}
              >
                <Terminal className="inline-block w-4 h-4 mr-2" />
                Test Results
              </button>
            </div>

            <div
              className="p-6 flex-1 overflow-auto"
              style={{ maxHeight: "70vh" }}
            >
              {activeTab === "problem" && problems[currentQuestionIndex] ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {problems[currentQuestionIndex].questionHeader}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            problems[currentQuestionIndex].difficulty === "Easy"
                              ? "bg-green-500"
                              : problems[currentQuestionIndex].difficulty ===
                                "Medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          } text-white`}
                        >
                          {problems[currentQuestionIndex].difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600"
                            : "bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextQuestion}
                        disabled={currentQuestionIndex === problems.length - 1}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600"
                            : "bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p
                    className={`text-base ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } whitespace-pre-line mb-6`}
                  >
                    {problems[currentQuestionIndex].description}
                  </p>
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Examples</h4>
                    {problems[currentQuestionIndex].examples.map(
                      (example, idx) => (
                        <div
                          key={idx}
                          className={`border ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-700/50"
                              : "border-gray-200"
                          } rounded-lg p-4 mb-4`}
                        >
                          <p className="text-base">
                            <strong>Input:</strong> {example.input}
                          </p>
                          <p className="text-base">
                            <strong>Output:</strong> {example.output}
                          </p>
                          <p
                            className={`text-base ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            <strong>Explanation:</strong> {example.explanation}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Constraints</h4>
                    <ul
                      className={`list-disc pl-5 text-base ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {problems[currentQuestionIndex].constraints.map(
                        (constraint, idx) => (
                          <li key={idx}>{constraint}</li>
                        )
                      )}
                    </ul>
                  </div>
                </>
              ) : activeTab === "results" ? (
                <>
                  <h3 className="text-xl font-semibold mb-4">Test Results</h3>
                  {testResults.executionError && (
                    <div
                      className={`p-4 mb-4 rounded-lg ${
                        isDarkMode
                          ? "bg-red-900/30 text-red-300"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {testResults.executionError}
                    </div>
                  )}
                  {testResults.overallResult !== null && (
                    <div
                      className={`p-4 mb-4 rounded-lg ${
                        testResults.overallResult
                          ? isDarkMode
                            ? "bg-green-900/30 text-green-300"
                            : "bg-green-100 text-green-600"
                          : isDarkMode
                          ? "bg-red-900/30 text-red-300"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {testResults.overallResult
                        ? "🎉 All tests passed! Great job!"
                        : "❌ Some tests failed. Check the details below."}
                    </div>
                  )}
                  {isRunning && (
                    <div
                      className={`p-4 mb-4 rounded-lg ${
                        isDarkMode
                          ? "bg-blue-900/30 text-blue-300"
                          : "bg-blue-100 text-blue-600"
                      } flex items-center`}
                    >
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Running tests...
                    </div>
                  )}
                  {testResults.sampleTestsPassed && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">
                        Sample Tests
                      </h4>
                      {testResults.sampleTestsPassed.map((test, idx) => (
                        <div
                          key={idx}
                          className={`p-4 mb-2 rounded-lg border ${
                            test.passed
                              ? isDarkMode
                                ? "border-green-600 bg-green-900/20"
                                : "border-green-200 bg-green-50"
                              : isDarkMode
                              ? "border-red-600 bg-red-900/20"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              Sample Test {idx + 1}
                            </span>
                            {test.passed ? (
                              <span
                                className={`flex items-center ${
                                  isDarkMode
                                    ? "text-green-400"
                                    : "text-green-600"
                                }`}
                              >
                                <Check className="w-4 h-4 mr-1" /> Passed
                              </span>
                            ) : (
                              <span
                                className={`flex items-center ${
                                  isDarkMode ? "text-red-400" : "text-red-600"
                                }`}
                              >
                                <X className="w-4 h-4 mr-1" /> Failed
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            <p>
                              <strong>Input:</strong> {test.input}
                            </p>
                            <p>
                              <strong>Expected Output:</strong>{" "}
                              {test.expectedOutput}
                            </p>
                            {test.output && (
                              <p>
                                <strong>Your Output:</strong> {test.output}
                              </p>
                            )}
                            {test.error && (
                              <p className="text-red-500">
                                <strong>Error:</strong> {test.error}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {testResults.testCaseResults &&
                    testResults.testCaseResults.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-2">
                          All Test Cases
                        </h4>
                        {testResults.testCaseResults.map((test, idx) => (
                          <div
                            key={idx}
                            className={`p-4 mb-2 rounded-lg border ${
                              test.status === "passed"
                                ? isDarkMode
                                  ? "border-green-600 bg-green-900/20"
                                  : "border-green-200 bg-green-50"
                                : isDarkMode
                                ? "border-red-600 bg-red-900/20"
                                : "border-red-200 bg-red-50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                Test Case {idx + 1}
                              </span>
                              {test.status === "passed" ? (
                                <span
                                  className={`flex items-center ${
                                    isDarkMode
                                      ? "text-green-400"
                                      : "text-green-600"
                                  }`}
                                >
                                  <Check className="w-4 h-4 mr-1" /> Passed
                                </span>
                              ) : (
                                <span
                                  className={`flex items-center ${
                                    isDarkMode ? "text-red-400" : "text-red-600"
                                  }`}
                                >
                                  <X className="w-4 h-4 mr-1" /> Failed
                                </span>
                              )}
                            </div>
                            <div className="text-sm">
                              <p>
                                <strong>Input:</strong> {test.input}
                              </p>
                              <p>
                                <strong>Expected Output:</strong> {test.output}
                              </p>
                              {test.actualOutput && (
                                <p>
                                  <strong>Your Output:</strong>{" "}
                                  {test.actualOutput}
                                </p>
                              )}
                              {test.error && (
                                <p className="text-red-500">
                                  <strong>Error:</strong> {test.error}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  {executionOutput && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">
                        Execution Output
                      </h4>
                      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
                        {executionOutput}
                      </pre>
                      {executionTime && (
                        <p className="text-sm text-gray-600 mt-1">
                          Execution Time: {executionTime}ms
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </section>

          {/* Right Section - Code Editor and Controls */}
          <section
            className={`w-full ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg rounded-xl p-4 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-4">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="p-2 rounded border focus:outline-none"
                >
                  <option value="nodejs">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                </select>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center space-x-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Sample Test</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isRunning}
                  className="flex items-center space-x-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 focus:outline-none"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Submit Code</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  {isRunning
                    ? "Running..."
                    : executionTime
                    ? `Last run: ${executionTime}ms`
                    : ""}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <CodeMirror
                value={code}
                height="50vh"
                extensions={[languageExtension]}
                theme={isDarkMode ? githubDark : githubLight}
                onChange={(value) => setCode(value)}
              />
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Custom Input</h4>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom input here..."
                className={`w-full p-2 border rounded focus:outline-none ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-50 text-black border-gray-300"
                }`}
                rows={3}
              />
              <button
                onClick={handleRunCustomInput}
                disabled={isRunning}
                className="mt-2 w-full flex items-center justify-center bg-purple-500 text-white p-2 rounded hover:bg-purple-600 focus:outline-none"
              >
                <Code className="w-4 h-4 mr-1" />
                <span>Run with Custom Input</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
