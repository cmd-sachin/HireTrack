"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Code,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useAssessmentStore from "../../store/assessmentStore";

// Dynamically import CodeMirror for client-side rendering
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { githubLight } from "@uiw/codemirror-theme-github";

// Helper function to find matching closing bracket/brace
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
    if (str[i] === open) count++;
    else if (str[i] === close) {
      count--;
      if (count === 0) return i;
    }
  }
  return -1;
}

// Parse value helper
const parseValue = (str) => {
  try {
    if (!str) return str;
    str = str.trim();
    if (!(str.startsWith("{") || str.startsWith("["))) {
      return str;
    }
    if (str.startsWith("[")) {
      const closingIndex = findMatchingBracketIndex(str, 0);
      if (closingIndex === -1)
        throw new Error("No matching closing bracket found.");
      if (closingIndex < str.length - 1) {
        const firstPart = str.substring(0, closingIndex + 1);
        let remainder = str.substring(closingIndex + 1).trim();
        if (remainder.startsWith(","))
          remainder = remainder.substring(1).trim();
        return [JSON.parse(firstPart), JSON.parse(remainder)];
      }
      return JSON.parse(str);
    }
    if (str.startsWith("{")) {
      const closingIndex = findMatchingBracketIndex(str, 0);
      if (closingIndex === -1)
        throw new Error("No matching closing brace found.");
      if (closingIndex < str.length - 1) {
        const firstPart = str.substring(0, closingIndex + 1);
        let remainder = str.substring(closingIndex + 1).trim();
        if (remainder.startsWith(","))
          remainder = remainder.substring(1).trim();
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
  const router = useRouter();
  const { completeAssessment } = useAssessmentStore();

  // States for problems, code, test results, etc.
  const [code, setCode] = useState("");
  const [problems, setProblems] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResults, setTestResults] = useState({
    testCaseResults: [],
    overallResult: null,
    executionError: null,
  });
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState("");
  const [executionTime, setExecutionTime] = useState(null);
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Flag for data fetching
  const isFetching = problems.length === 0;

  // CodeMirror language extension
  const languageExtension = useMemo(() => {
    switch (selectedLanguage) {
      case "python":
        return python();
      case "java":
        return java();
      case "c":
        return cpp();
      default:
        return javascript();
    }
  }, [selectedLanguage]);

  // Fetch dynamic questions from API
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
      const mappedProblems = data.map((q) => {
        const sampleInput = JSON.stringify(parseValue(q.sampleTestCase.input));
        const sampleOutput = JSON.stringify(
          parseValue(q.sampleTestCase.output)
        );
        return {
          id: q.id || "dynamic-question",
          questionHeader: q.questionHeader,
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
            ? q.testCases.map((tc, idx) => ({
                id: idx,
                input: JSON.stringify(parseValue(tc.input)),
                output: JSON.stringify(parseValue(tc.output)),
                status: "pending",
                hidden: true,
              }))
            : [],
          starterCode: q.starterCode,
        };
      });
      setProblems(mappedProblems);
      setCurrentQuestionIndex(0);
      if (mappedProblems.length > 0 && mappedProblems[0].starterCode) {
        setCode(mappedProblems[0].starterCode[selectedLanguage]);
      }
    } catch (err) {
      console.error("Error fetching dynamic questions:", err);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    fetchDynamicQuestions();
  }, [fetchDynamicQuestions]);

  // Update code when language or question changes
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
      testCaseResults: [],
      overallResult: null,
      executionError: null,
    });
  }, [selectedLanguage]);

  // Execute code via API
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

  // Run code handler: always uses sample input
  const handleRunCode = useCallback(async () => {
    if (code.trim() === "") {
      setExecutionOutput("Please write some code before running.");
      return;
    }
    const sampleInput =
      problems[currentQuestionIndex]?.examples?.[0]?.input || "";
    try {
      const result = await executeCode(code, selectedLanguage, sampleInput);
      setExecutionOutput(result.success ? result.output : result.error);
    } catch (error) {
      setExecutionOutput(`Error: ${error.message}`);
    }
  }, [code, selectedLanguage, problems, currentQuestionIndex]);

  // Handler for submitting code (runs all test cases)
  const handleSubmit = useCallback(async () => {
    const testCases = problems[currentQuestionIndex]?.testCases;
    if (!testCases || testCases.length === 0) {
      setTestResults((prev) => ({
        ...prev,
        executionError: "No test cases available for this problem.",
      }));
      return;
    }
    try {
      let updatedTestCases = testCases.map((tc) => ({
        ...tc,
        status: "running",
      }));
      setTestResults({
        testCaseResults: updatedTestCases,
        overallResult: null,
        executionError: null,
      });
      const resultsArr = [];
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
          hidden: false,
        }));
        resultsArr.push({ ...testCase, passed });
        setTestResults((prev) => ({
          ...prev,
          testCaseResults: updatedTestCases,
        }));
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const overallResult = resultsArr.every((test) => test.passed);
      setTestResults((prev) => ({
        ...prev,
        overallResult,
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        overallResult: false,
        executionError: error.message,
      }));
    }
  }, [code, selectedLanguage, problems, currentQuestionIndex]);

  // Finish button handler: show modal
  const handleFinish = () => {
    setShowFinishModal(true);
  };

  const confirmFinish = () => {
    completeAssessment("coding");
    router.push("/hire");
  };

  // Navigation for problems
  const handlePreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setTestResults({
      testCaseResults: [],
      overallResult: null,
      executionError: null,
    });
    setExecutionOutput("");
  }, []);

  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) =>
      prev < problems.length - 1 ? prev + 1 : prev
    );
    setTestResults({
      testCaseResults: [],
      overallResult: null,
      executionError: null,
    });
    setExecutionOutput("");
  }, [problems.length]);

  return (
    <div className="min-h-screen bg-[#F5F9FF] text-[#031930] relative">
      {/* Spinner overlay while fetching data */}
      {isFetching && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
        </div>
      )}

      {/* Main Content Wrapper with blur when modal is open */}
      <div className={`${showFinishModal ? "filter blur-md" : ""}`}>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#031930] to-[#223A59] py-6 px-4 shadow-md">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
              Coding Challenge
            </h1>
            <p className="mt-2 text-sm md:text-base text-[#D0E6FF] max-w-2xl mx-auto">
              Demonstrate your coding expertise by solving complex algorithmic
              problems.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section – Problem Details */}
          <section className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">
                {problems[currentQuestionIndex]?.questionHeader || "Loading..."}
              </h3>
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
            <p className="text-base whitespace-pre-line mb-6">
              {problems[currentQuestionIndex]?.description}
            </p>
            {problems[currentQuestionIndex]?.examples && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Examples</h4>
                {problems[currentQuestionIndex].examples.map((example, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 mb-4"
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
            )}
            {problems[currentQuestionIndex]?.constraints && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Constraints</h4>
                <ul className="list-disc pl-5 text-base text-gray-700">
                  {problems[currentQuestionIndex].constraints.map(
                    (constraint, idx) => (
                      <li key={idx}>{constraint}</li>
                    )
                  )}
                </ul>
              </div>
            )}
            {problems[currentQuestionIndex]?.testCases &&
              problems[currentQuestionIndex].testCases.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">Test Cases</h4>
                  {problems[currentQuestionIndex].testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center border-b border-gray-200 py-1"
                    >
                      <span className="text-base">Test Case {idx + 1}</span>
                      {testResults.testCaseResults[idx] && (
                        <button
                          className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            testResults.testCaseResults[idx].status === "passed"
                              ? "bg-green-500 text-white"
                              : testResults.testCaseResults[idx].status ===
                                "failed"
                              ? "bg-red-500 text-white"
                              : "bg-gray-300 text-gray-700"
                          }`}
                          disabled
                        >
                          {testResults.testCaseResults[idx].status === "passed"
                            ? "Passed"
                            : testResults.testCaseResults[idx].status ===
                              "failed"
                            ? "Failed"
                            : ""}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </section>

          {/* Right Section – Code Editor and Controls */}
          <section className="bg-white shadow-lg rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {/* Language selector placed to the left */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="p-2 rounded border focus:outline-none text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                </select>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center space-x-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none text-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Code</span>
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmit}
                  disabled={isRunning}
                  className="flex items-center space-x-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 focus:outline-none text-sm"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Submit Code</span>
                </button>
                <button
                  onClick={handleFinish}
                  className="flex items-center space-x-2 bg-purple-500 text-white p-2 rounded hover:bg-purple-600 focus:outline-none text-sm"
                >
                  <Code className="w-4 h-4" />
                  <span>Finish</span>
                </button>
              </div>
            </div>
            <div className="flex-1">
              <CodeMirror
                value={code}
                height="50vh"
                extensions={[languageExtension]}
                theme={githubLight}
                onChange={(value) => setCode(value)}
              />
            </div>
            {/* Execution Output box always visible */}
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Execution Output</h4>
              <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap min-h-[100px]">
                {executionOutput}
              </pre>
            </div>
          </section>
        </div>
      </div>

      {/* Finish Confirmation Modal */}
      {showFinishModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center backdrop-blur-md bg-transparent"
          onClick={() => setShowFinishModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mt-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-blue-600 mb-4 text-center">
              Confirm Finish
            </h2>
            <p className="mb-6 text-center">
              Are you sure you want to finish? Your assessment will be
              submitted.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmFinish}
                className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
