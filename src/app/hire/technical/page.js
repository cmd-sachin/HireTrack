// page.js
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
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useAssessmentStore from "../../store/assessmentStore";
import useTechnicalStore from "../../store/technicalStore";
import { shallow } from "zustand/shallow";

// Dynamically import CodeMirror for client-side rendering
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { githubLight } from "@uiw/codemirror-theme-github";

// Helper function to find matching bracket index.
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

const parseValue = (str) => {
  if (!str) return str;
  const trimmed = str.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (!isNaN(trimmed) && trimmed !== "") return Number(trimmed);
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      if (trimmed.startsWith("[")) {
        const closingIndex = findMatchingBracketIndex(trimmed, 0);
        if (closingIndex === -1)
          throw new Error("No matching closing bracket found.");
        if (closingIndex < trimmed.length - 1) {
          const firstPart = trimmed.substring(0, closingIndex + 1);
          let remainder = trimmed.substring(closingIndex + 1).trim();
          if (remainder.startsWith(","))
            remainder = remainder.substring(1).trim();
          return [JSON.parse(firstPart), JSON.parse(remainder)];
        }
      }
      if (trimmed.startsWith("{")) {
        const closingIndex = findMatchingBracketIndex(trimmed, 0);
        if (closingIndex === -1)
          throw new Error("No matching closing brace found.");
        if (closingIndex < trimmed.length - 1) {
          const firstPart = trimmed.substring(0, closingIndex + 1);
          let remainder = trimmed.substring(closingIndex + 1).trim();
          if (remainder.startsWith(","))
            remainder = remainder.substring(1).trim();
          return [JSON.parse(firstPart), JSON.parse(remainder)];
        }
      }
    }
  }
  return trimmed;
};

export default function CodingRoundPage() {
  const router = useRouter();
  const { completeAssessment } = useAssessmentStore();
  const { setQuestion, updateCode, updateTestResults } = useTechnicalStore();

  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [problems, setProblems] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState("");
  const [executionTime, setExecutionTime] = useState(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState("description");

  const isFetching = problems.length === 0;
  // Use the question header as the key.
  const currentQuestionHeader =
    problems[currentQuestionIndex]?.questionHeader || "Dynamic Question";

  // Cache default testResults (only testCaseResults)
  const defaultTestResults = useMemo(() => ({ testCaseResults: [] }), []);
  const selectTestResults = useCallback(
    (state) =>
      state.questions[currentQuestionHeader]?.testResults || defaultTestResults,
    [currentQuestionHeader, defaultTestResults]
  );
  const currentTestResults = useTechnicalStore(selectTestResults, shallow);

  const languageExtension = useMemo(() => {
    switch (selectedLanguage) {
      case "javascript":
        return javascript();
      case "java":
        return java();
      case "c":
        return cpp();
      default:
        return python();
    }
  }, [selectedLanguage]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Fetch dynamic questions and update the store using questionHeader as key.
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
          "Invalid question data received: " + JSON.stringify(data)
        );
      }
      const mappedProblems = data.map((q) => {
        const sampleInput = parseValue(q.sampleTestCase.input);
        const sampleOutput = parseValue(q.sampleTestCase.output);
        // Update the store using the question header as the key.
        setQuestion(q.questionHeader, {
          description: q.question,
          sampleTestcase: {
            input: sampleInput,
            output: sampleOutput,
            explanation: q.sampleTestCase.explanation,
          },
          constraints: q.inputConstraints || [],
          // Remove the "id" field from testcases.
          testcases: q.testCases
            ? q.testCases.map((tc) => ({
                input: parseValue(tc.input),
                output: parseValue(tc.output),
                status: "pending",
                hidden: true,
              }))
            : [],
          userCode: q.starterCode ? q.starterCode[selectedLanguage] : "",
          testResults: {
            testCaseResults: [],
          },
        });
        return {
          questionHeader: q.questionHeader,
          description: q.question,
          sampleTestcase: {
            input: sampleInput,
            output: sampleOutput,
            explanation: q.sampleTestCase.explanation,
          },
          constraints: q.inputConstraints || [],
          // Remove the "id" field from testcases.
          testcases: q.testCases
            ? q.testCases.map((tc) => ({
                input: parseValue(tc.input),
                output: parseValue(tc.output),
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
        const initialCode = mappedProblems[0].starterCode[selectedLanguage];
        setCode(initialCode);
        updateCode(mappedProblems[0].questionHeader, initialCode);
      }
    } catch (err) {
      console.error("Error fetching dynamic questions:", err);
    }
  }, [selectedLanguage, setQuestion, updateCode]);

  useEffect(() => {
    // When the question changes, initialize testResults if needed.
    if (
      currentQuestionHeader &&
      !useTechnicalStore.getState().questions[currentQuestionHeader]
        ?.testResults
    ) {
      updateTestResults(currentQuestionHeader, defaultTestResults);
    }
  }, [currentQuestionHeader, updateTestResults, defaultTestResults]);

  useEffect(() => {
    fetchDynamicQuestions();
  }, [fetchDynamicQuestions]);

  useEffect(() => {
    if (
      problems.length > 0 &&
      problems[currentQuestionIndex].starterCode &&
      problems[currentQuestionIndex].starterCode[selectedLanguage]
    ) {
      const updatedCode =
        problems[currentQuestionIndex].starterCode[selectedLanguage];
      setCode(updatedCode);
      updateCode(problems[currentQuestionIndex].questionHeader, updatedCode);
    } else {
      setCode("");
      updateCode(
        problems[currentQuestionIndex]?.questionHeader || "Dynamic Question",
        ""
      );
    }
  }, [problems, currentQuestionIndex, selectedLanguage, updateCode]);

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

  const handleRunCode = useCallback(async () => {
    if (code.trim() === "") {
      setExecutionOutput("Please write some code before running.");
      return;
    }
    const sampleInput = String(
      problems[currentQuestionIndex]?.sampleTestcase?.input || ""
    );
    try {
      const result = await executeCode(code, selectedLanguage, sampleInput);
      setExecutionOutput(result.success ? result.output : result.error);
    } catch (error) {
      setExecutionOutput(`Error: ${error.message}`);
    }
  }, [code, selectedLanguage, problems, currentQuestionIndex]);

  const handleSubmit = useCallback(async () => {
    const testcases = problems[currentQuestionIndex]?.testcases;
    if (!testcases || testcases.length === 0) {
      updateTestResults(currentQuestionHeader, {
        testCaseResults: [],
      });
      return;
    }
    try {
      let updatedTestCases = testcases.map((tc) => ({
        ...tc,
        status: "running",
      }));
      updateTestResults(currentQuestionHeader, {
        testCaseResults: updatedTestCases,
      });
      for (let i = 0; i < updatedTestCases.length; i++) {
        const testCase = updatedTestCases[i];
        updatedTestCases = updatedTestCases.map((tc, idx) => ({
          ...tc,
          status: idx === i ? "running" : tc.status,
        }));
        updateTestResults(currentQuestionHeader, {
          testCaseResults: updatedTestCases,
        });
        const result = await executeCode(
          code,
          selectedLanguage,
          String(testCase.input)
        );
        const passed =
          result.success && result.output.trim() === String(testCase.output);
        updatedTestCases = updatedTestCases.map((tc, idx) => ({
          ...tc,
          status: idx === i ? (passed ? "passed" : "failed") : tc.status,
          hidden: false,
        }));
        updateTestResults(currentQuestionHeader, {
          testCaseResults: updatedTestCases,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      // We no longer store overall results.
      updateTestResults(currentQuestionHeader, {
        testCaseResults: updatedTestCases,
      });
    } catch (error) {
      updateTestResults(currentQuestionHeader, {
        testCaseResults: [],
      });
    }
  }, [
    code,
    selectedLanguage,
    problems,
    currentQuestionIndex,
    currentQuestionHeader,
    updateTestResults,
  ]);

  const handleFinish = () => setShowFinishModal(true);
  const confirmFinish = () => {
    // Save current state before completing.
    updateCode(currentQuestionHeader, code);
    // Optionally verify that all questions have been attempted.
    const allQuestionsAttempted = problems.every((problem) => {
      const header = problem.questionHeader;
      const questionState = useTechnicalStore.getState().questions[header];
      return (
        questionState &&
        questionState.userCode &&
        questionState.userCode.trim() !== ""
      );
    });
    if (!allQuestionsAttempted) {
      console.warn("Not all questions were attempted");
    }
    completeAssessment("coding");
    router.push("/hire");
  };

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      updateCode(currentQuestionHeader, code);
      setCurrentQuestionIndex((prev) => prev - 1);
      setExecutionOutput("");
      setTimeout(() => {
        const prevHeader =
          problems[currentQuestionIndex - 1]?.questionHeader ||
          "Dynamic Question";
        updateTestResults(prevHeader, {
          testCaseResults: (
            problems[currentQuestionIndex - 1]?.testcases || []
          ).map((tc) => ({
            ...tc,
            status: "pending",
            hidden: true,
          })),
        });
      }, 0);
    }
  }, [
    currentQuestionIndex,
    problems,
    currentQuestionHeader,
    code,
    updateCode,
    updateTestResults,
  ]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < problems.length - 1) {
      updateCode(currentQuestionHeader, code);
      setCurrentQuestionIndex((prev) => prev + 1);
      setExecutionOutput("");
      setTimeout(() => {
        const nextHeader =
          problems[currentQuestionIndex + 1]?.questionHeader ||
          "Dynamic Question";
        updateTestResults(nextHeader, {
          testCaseResults: (
            problems[currentQuestionIndex + 1]?.testcases || []
          ).map((tc) => ({
            ...tc,
            status: "pending",
            hidden: true,
          })),
        });
      }, 0);
    }
  }, [
    currentQuestionIndex,
    problems,
    currentQuestionHeader,
    code,
    updateCode,
    updateTestResults,
  ]);

  // Render test case status using the status string.
  const TestCaseStatus = ({ status }) => {
    if (status === "passed") {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === "failed") {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else if (status === "running") {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    return <HelpCircle className="w-5 h-5 text-gray-300" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9FF] to-[#EDF6FF] text-[#031930] relative">
      {isFetching && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            <p className="mt-4 text-blue-800 font-medium">
              Loading challenge...
            </p>
          </div>
        </div>
      )}
      <div className={`${showFinishModal ? "filter blur-sm" : ""}`}>
        <div className="bg-gradient-to-r from-[#031930] via-[#132D49] to-[#223A59] py-8 px-6 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                Code&apos;N Track
              </h1>
              <div className="w-24 h-1 bg-blue-400 rounded mb-4"></div>
              <p className="text-base md:text-lg text-[#D0E6FF] max-w-2xl text-center">
                Demonstrate your coding expertise by solving complex algorithmic
                problems with elegant solutions.
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <section className="lg:w-5/12 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-50">
                <div className="bg-gradient-to-r from-[#EBF4FF] to-[#F8FBFF] p-4 border-b border-blue-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#031930] truncate pr-2">
                    {problems[currentQuestionIndex]?.questionHeader ||
                      "Loading..."}
                  </h3>
                  <div className="flex space-x-2 items-center">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
                      title="Previous question"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-[#031930]">
                      {currentQuestionIndex + 1}/{problems.length}
                    </span>
                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === problems.length - 1}
                      className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
                      title="Next question"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="border-b border-gray-100 pb-3">
                    <button
                      onClick={() => toggleSection("description")}
                      className="w-full flex items-center justify-between py-2 focus:outline-none"
                    >
                      <h4 className="text-lg font-semibold text-[#031930]">
                        Problem Description
                      </h4>
                      {expandedSection === "description" ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                    {expandedSection === "description" && (
                      <div className="pt-2 pb-3 text-[#374151] whitespace-pre-line">
                        {problems[currentQuestionIndex]?.description}
                      </div>
                    )}
                  </div>
                  <div className="border-b border-gray-100 py-2">
                    <button
                      onClick={() => toggleSection("sampleTestcase")}
                      className="w-full flex items-center justify-between py-2 focus:outline-none"
                    >
                      <h4 className="text-lg font-semibold text-[#031930]">
                        Sample Test Case
                      </h4>
                      {expandedSection === "sampleTestcase" ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                    {expandedSection === "sampleTestcase" && (
                      <div className="pt-2 pb-3">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-2">
                          <p className="text-sm mb-1 text-gray-500">Input:</p>
                          <p className="font-mono text-sm">
                            {JSON.stringify(
                              problems[currentQuestionIndex]?.sampleTestcase
                                ?.input
                            )}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-2">
                          <p className="text-sm mb-1 text-gray-500">Output:</p>
                          <p className="font-mono text-sm">
                            {JSON.stringify(
                              problems[currentQuestionIndex]?.sampleTestcase
                                ?.output
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm mb-1 text-gray-500">
                            Explanation:
                          </p>
                          <p className="text-sm text-gray-700">
                            {
                              problems[currentQuestionIndex]?.sampleTestcase
                                ?.explanation
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {problems[currentQuestionIndex]?.constraints && (
                    <div className="border-b border-gray-100 py-2">
                      <button
                        onClick={() => toggleSection("constraints")}
                        className="w-full flex items-center justify-between py-2 focus:outline-none"
                      >
                        <h4 className="text-lg font-semibold text-[#031930]">
                          Constraints
                        </h4>
                        {expandedSection === "constraints" ? (
                          <ChevronUp className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                      {expandedSection === "constraints" && (
                        <div className="pt-2 pb-3">
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                            {problems[currentQuestionIndex].constraints.map(
                              (constraint, idx) => (
                                <li key={idx}>{constraint}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {problems[currentQuestionIndex]?.testcases &&
                    problems[currentQuestionIndex].testcases.length > 0 && (
                      <div className="py-2">
                        <button
                          onClick={() => toggleSection("testCases")}
                          className="w-full flex items-center justify-between py-2 focus:outline-none"
                        >
                          <h4 className="text-lg font-semibold text-[#031930]">
                            Test Cases
                          </h4>
                          {expandedSection === "testCases" ? (
                            <ChevronUp className="w-5 h-5 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-blue-600" />
                          )}
                        </button>
                        {expandedSection === "testCases" && (
                          <div className="pt-2 pb-3">
                            <div className="space-y-2">
                              {problems[currentQuestionIndex].testcases.map(
                                (tc, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex justify-between items-center p-3 rounded-lg ${
                                      currentTestResults.testCaseResults[idx]
                                        ?.status === "passed"
                                        ? "bg-green-50 border border-green-100"
                                        : currentTestResults.testCaseResults[
                                            idx
                                          ]?.status === "failed"
                                        ? "bg-red-50 border border-red-100"
                                        : "bg-gray-50 border border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <TestCaseStatus
                                        status={
                                          currentTestResults.testCaseResults[
                                            idx
                                          ]?.status
                                        }
                                      />
                                      <span className="ml-3 font-medium text-gray-700">
                                        Test Case {idx + 1}
                                      </span>
                                    </div>
                                    <div className="text-xs font-medium uppercase">
                                      {currentTestResults.testCaseResults[idx]
                                        ?.status || "Pending"}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </section>
            <section className="lg:w-7/12 flex flex-col">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-50 flex flex-col h-full">
                <div className="bg-gradient-to-r from-[#EBF4FF] to-[#F8FBFF] p-4 border-b border-blue-100 flex flex-wrap gap-3 justify-between">
                  <div className="flex items-center space-x-3">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="c">C</option>
                    </select>
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                    >
                      {isRunning ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      <span>Run Code</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSubmit}
                      disabled={isRunning}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70"
                    >
                      {isRunning ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Terminal className="w-4 h-4 mr-2" />
                      )}
                      <span>Submit</span>
                    </button>
                    <button
                      onClick={handleFinish}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      <span>Finish</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1 border-b border-blue-100 overflow-hidden">
                  <CodeMirror
                    value={code}
                    height="calc(50vh - 88px)"
                    extensions={[languageExtension]}
                    theme={githubLight}
                    onChange={(value) => {
                      setCode(value);
                      updateCode(currentQuestionHeader, value);
                    }}
                    className="h-full text-base"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-[#031930]">
                      Execution Output
                    </h4>
                    {executionTime && (
                      <div className="flex items-center text-xs font-medium text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{executionTime} ms</span>
                      </div>
                    )}
                  </div>
                  <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap h-40 overflow-auto text-sm font-mono">
                    {executionOutput || "Run your code to see the output here."}
                  </pre>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      {showFinishModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold text-[#031930] mb-4">
              Finish Assessment
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to finish the coding assessment? You
              won&apos;t be able to return to this section.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmFinish}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
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
