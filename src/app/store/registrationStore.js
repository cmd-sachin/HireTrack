import { create } from "zustand";

const useRegistrationStore = create((set) => ({
  // Initial state for registration without skills
  name: "",
  email: "",
  linkedin: "",
  github: "",
  resume: "",

  // Method to set or update the registration data.
  setRegistrationData: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),

  // Optional: Method to update a single field
  updateField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  // Method to reset the registration data to initial values.
  resetRegistrationData: () =>
    set({
      name: "",
      email: "",
      linkedin: "",
      github: "",
      resume: "",
    }),
}));

export default useRegistrationStore;
