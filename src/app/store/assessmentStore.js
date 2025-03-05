import { create } from "zustand";

const useAssessmentStore = create((set) => ({
  assessmentStatus: {
    aptitude: { unlocked: true, completed: false },
    coding: { unlocked: false, completed: false },
    interview: { unlocked: false, completed: false },
  },

  completeAssessment: (type) =>
    set((state) => {
      const updatedStatus = { ...state.assessmentStatus };
      updatedStatus[type].completed = true;

      // Unlock next round
      if (type === "aptitude") {
        updatedStatus.coding.unlocked = true;
      } else if (type === "coding") {
        updatedStatus.interview.unlocked = true;
      }

      return { assessmentStatus: updatedStatus };
    }),

  resetProgress: () =>
    set({
      assessmentStatus: {
        aptitude: { unlocked: true, completed: false },
        coding: { unlocked: false, completed: false },
        interview: { unlocked: false, completed: false },
      },
    }),
}));

export default useAssessmentStore;
