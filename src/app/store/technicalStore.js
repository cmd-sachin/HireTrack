// technicalStore.js
import { create } from "zustand";

const useTechnicalStore = create((set) => ({
  questions: {},
  // Set or update a question using the question header as the key.
  setQuestion: (questionHeader, questionData) => {
    set((state) => ({
      questions: {
        ...state.questions,
        [questionHeader]: {
          description: questionData.description,
          sampleTestcase: questionData.sampleTestcase,
          constraints: questionData.constraints,
          testcases: questionData.testcases,
          userCode: questionData.userCode || "",
          testResults: state.questions[questionHeader]?.testResults || {
            testCaseResults: [],
          },
        },
      },
    }));
  },
  // Update the user code for a given question (using question header as key).
  updateCode: (questionHeader, code) => {
    set((state) => ({
      questions: {
        ...state.questions,
        [questionHeader]: {
          ...state.questions[questionHeader],
          userCode: code,
        },
      },
    }));
  },
  // Update the test results for a given question.
  updateTestResults: (questionHeader, results) => {
    set((state) => ({
      questions: {
        ...state.questions,
        [questionHeader]: {
          ...state.questions[questionHeader],
          testResults: results,
        },
      },
    }));
  },
  // Reset the store.
  resetStore: () => set({ questions: {} }),
}));

export default useTechnicalStore;
