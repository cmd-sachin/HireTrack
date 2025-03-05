"use client";
import React, { useState } from "react";
import {
  Briefcase,
  Upload,
  ArrowRight,
  Linkedin,
  Github,
  Mail,
  User,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "./../components/NavBar";

export default function RegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    github: "",
    resume: null,
    skills: [],
  });
  const [errors, setErrors] = useState({});
  const [resumeFileName, setResumeFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        resume: file,
      }));
      setResumeFileName(file.name);
    }
  };

  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, value],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        skills: prev.skills.filter((skill) => skill !== value),
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required.";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address.";
    }

    // Validate LinkedIn URL (must start with https://linkedin.com/)
    if (!formData.linkedin.trim()) {
      newErrors.linkedin = "LinkedIn URL is required.";
    } else if (
      !/^https:\/\/(www\.)?linkedin\.com\/.*$/.test(formData.linkedin)
    ) {
      newErrors.linkedin = "Invalid LinkedIn URL.";
    }

    // Validate resume file
    if (!formData.resume) {
      newErrors.resume = "Resume/CV is required.";
    } else if (formData.resume.size > 5242880) {
      newErrors.resume = "File size exceeds 5MB.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log(formData);
      setSubmitting(false);
      router.push("/hire"); // Navigate after validation passes
    }, 1500);
  };

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
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
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
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
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
                {errors.linkedin && (
                  <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>
                )}
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
                {errors.resume && (
                  <p className="text-red-500 text-sm mt-1">{errors.resume}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex flex-col items-center">
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-2/3 bg-gradient-to-r from-[#223A59] to-[#3684DB] text-white py-4 px-8 rounded-lg font-bold text-lg flex items-center justify-center hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
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
