"use client";
import React, { useState } from "react";
import {
  Briefcase,
  Upload,
  ArrowRight,
  Calendar,
  School,
  Linkedin,
  Github,
  Mail,
  User,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Navbar from "./../components/NavBar";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    github: "",
    resume: null,
    college: "",
    graduationYear: "",
    skills: [],
    jobPreference: "",
  });

  const [resumeFileName, setResumeFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        resume: file,
      });
      setResumeFileName(file.name);
    }
  };

  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        skills: [...formData.skills, value],
      });
    } else {
      setFormData({
        ...formData,
        skills: formData.skills.filter((skill) => skill !== value),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log(formData);
      setSubmitting(false);
      // Redirect to assessment page (in a real app)
      // router.push('/assessment/aptitude');
    }, 1500);
  };

  // Current year for graduation year dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 3 + i);

  const commonSkills = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "Java",
    "C++",
    "Data Analysis",
    "UI/UX",
    "Cloud Computing",
  ];

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#223A59] to-[#3684DB] p-8 text-white">
            <h1 className="text-3xl font-bold">Launch Your Career Journey</h1>
            <p className="mt-2 text-[#B3D6F9]">
              Complete your profile to begin your personalized assessment
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-[#031930] mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-[#3684DB]" />
                  Personal Information
                </h2>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#758BA5]"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#758BA5] w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    className="pl-10 w-full p-3 border border-[#D1DDED] rounded-lg focus:ring-2 focus:ring-[#3684DB] focus:border-[#3684DB] outline-none transition-all text-[#4A5568] placeholder:text-[#A8B2CF]"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#758BA5]"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#758BA5] w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="pl-10 w-full p-3 border border-[#D1DDED] rounded-lg focus:ring-2 focus:ring-[#3684DB] focus:border-[#3684DB] outline-none transition-all text-[#4A5568] placeholder:text-[#A8B2CF]"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="md:col-span-2 mt-6">
                <h2 className="text-xl font-semibold text-[#031930] mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-[#3684DB]" />
                  Professional Information
                </h2>
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <label
                  htmlFor="linkedin"
                  className="block text-sm font-medium text-[#758BA5]"
                >
                  LinkedIn URL *
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#758BA5] w-5 h-5" />
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    required
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/johnsmith"
                    className="pl-10 w-full p-3 border border-[#D1DDED] rounded-lg focus:ring-2 focus:ring-[#3684DB] focus:border-[#3684DB] outline-none transition-all text-[#4A5568] placeholder:text-[#A8B2CF]"
                  />
                </div>
              </div>

              {/* GitHub */}
              <div className="space-y-2">
                <label
                  htmlFor="github"
                  className="block text-sm font-medium text-[#758BA5]"
                >
                  GitHub URL
                </label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#758BA5] w-5 h-5" />
                  <input
                    type="url"
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="https://github.com/johnsmith"
                    className="pl-10 w-full p-3 border border-[#D1DDED] rounded-lg focus:ring-2 focus:ring-[#3684DB] focus:border-[#3684DB] outline-none transition-all text-[#4A5568] placeholder:text-[#A8B2CF]"
                  />
                </div>
              </div>

              {/* Resume Upload */}
              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="resume"
                  className="block text-sm font-medium text-[#758BA5]"
                >
                  Resume/CV (PDF, DOCX) *
                </label>
                <div className="relative border-2 border-dashed border-[#D1DDED] rounded-lg p-6 text-center hover:border-[#3684DB] transition-all">
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    required
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto h-12 w-12 text-[#758BA5]" />
                  <p className="mt-2 text-sm text-[#758BA5]">
                    {resumeFileName
                      ? `Selected: ${resumeFileName}`
                      : "Drag and drop your resume, or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-[#758BA5]">
                    Maximum file size: 5MB
                  </p>
                </div>
              </div>

              {/* Education */}
              <div className="md:col-span-2 mt-6">
                <h2 className="text-xl font-semibold text-[#031930] mb-4 flex items-center">
                  <School className="w-5 h-5 mr-2 text-[#3684DB]" />
                  Education
                </h2>
              </div>

              {/* College */}
              <div className="space-y-2">
                <label
                  htmlFor="college"
                  className="block text-sm font-medium text-[#758BA5]"
                >
                  College/University Name *
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#758BA5] w-5 h-5" />
                  <input
                    type="text"
                    id="college"
                    name="college"
                    required
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Stanford University"
                    className="pl-10 w-full p-3 border border-[#D1DDED] rounded-lg focus:ring-2 focus:ring-[#3684DB] focus:border-[#3684DB] outline-none transition-all text-[#4A5568] placeholder:text-[#A8B2CF]"
                  />
                </div>
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <label
                  htmlFor="graduationYear"
                  className="block text-sm font-medium text-[#758BA5]"
                >
                  Graduation Year *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#758BA5] w-5 h-5" />
                  <select
                    id="graduationYear"
                    name="graduationYear"
                    required
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 border border-[#D1DDED] rounded-lg focus:ring-2 focus:ring-[#3684DB] focus:border-[#3684DB] outline-none transition-all appearance-none bg-white text-[#718096] placeholder:text-[#A8B2CF]"
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills */}
              <div className="md:col-span-2 space-y-2 mt-6">
                <h2 className="text-xl font-semibold text-[#031930] mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-[#3684DB]" />
                  Skills & Preferences
                </h2>
                <label className="block text-sm font-medium text-[#758BA5] mb-2">
                  Select Your Key Skills (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonSkills.map((skill) => (
                    <div key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`skill-${skill}`}
                        name="skills"
                        value={skill}
                        checked={formData.skills.includes(skill)}
                        onChange={handleSkillChange}
                        className="h-4 w-4 text-[#3684DB] border-[#D1DDED] rounded focus:ring-[#3684DB]"
                      />
                      <label
                        htmlFor={`skill-${skill}`}
                        className="ml-2 text-sm text-[#758BA5]"
                      >
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex flex-col items-center">
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-2/3 bg-gradient-to-r from-[#223A59] to-[#3684DB] text-white py-4 px-8 rounded-lg font-bold text-lg flex items-center justify-center hover:shadow-lg transition-all duration-300 disabled:opacity-70"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Launch Your Assessment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </span>
                )}
              </button>
              <p className="mt-4 text-sm text-[#758BA5] text-center">
                By clicking &quot;Launch Your Assessment&quot;, you agree to our{" "}
                <Link href="/terms" className="text-[#3684DB] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[#3684DB] hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
