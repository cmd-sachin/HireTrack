// src/app/stores/aptitudeStore.js
import { create } from "zustand";

export const useAptitudeStore = create((set) => ({
  // Store for quiz data: each entry holds question, options, and user's response.
  quizData: [],

  // Method to add or update a quiz data entry.
  addOrUpdateQuizData: (quiz) =>
    set((state) => {
      const index = state.quizData.findIndex(
        (item) => item.questionNumber === quiz.questionNumber
      );
      if (index !== -1) {
        const updatedData = [...state.quizData];
        updatedData[index] = quiz;
        return { quizData: updatedData };
      }
      return { quizData: [...state.quizData, quiz] };
    }),

  // Optional: reset the quiz data.
  resetQuizData: () => set({ quizData: [] }),
}));
