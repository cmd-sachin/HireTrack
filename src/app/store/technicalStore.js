import { create } from "zustand";

const useTechnicalStore = create((set) => ({
  questions: {},

  // Set or update a question's details (including default test results)
  setQuestion: (questionId, questionData) => {
    set((state) => ({
      questions: {
        ...state.questions,
        [questionId]: {
          ...state.questions[questionId],
          ...questionData,
          // Ensure default structure for testResults exists.
          testResults: state.questions[questionId]?.testResults || {
            testCaseResults: [],
            overallResult: null,
            executionError: null,
          },
        },
      },
    }));
  },

  // Update the user's code for a given question.
  updateCode: (questionId, code) => {
    set((state) => ({
      questions: {
        ...state.questions,
        [questionId]: {
          ...state.questions[questionId],
          code,
        },
      },
    }));
  },

  // Update the test results for a given question.
  updateTestResults: (questionId, results) => {
    set((state) => ({
      questions: {
        ...state.questions,
        [questionId]: {
          ...state.questions[questionId],
          testResults: results,
        },
      },
    }));
  },

  // (Optional) Reset store.
  resetStore: () => set({ questions: {} }),
}));

export default useTechnicalStore;
