"use client";
import Link from "next/link";
import {
  Brain,
  Target,
  Trophy,
  Code,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/NavBar";

export default function About() {
  const milestones = [
    {
      icon: <Brain className="w-10 h-10 text-[#3684DB]" />,
      title: "AI-Powered Innovation",
      description:
        "Founded in 2023 with a mission to transform recruitment through cutting-edge AI technology.",
    },
    {
      icon: <Trophy className="w-10 h-10 text-[#3684DB]" />,
      title: "Industry Recognition",
      description:
        "Named 'Most Innovative HR Tech Startup' by Tech Innovations Awards in 2024.",
    },
    {
      icon: <Code className="w-10 h-10 text-[#3684DB]" />,
      title: "Technical Excellence",
      description:
        "Our AI models are trained on extensive datasets to provide unbiased, accurate candidate assessments.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#F5F9FF] py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-[#031930] mb-6">
            Revolutionizing Hiring Through AI
          </h1>
          <p className="text-xl text-[#758BA5] max-w-3xl mx-auto">
            HireTrack leverages advanced artificial intelligence to create a
            more efficient, unbiased, and comprehensive hiring process that
            matches top talent with innovative companies.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#031930] mb-6">
              Our Mission
            </h2>
            <p className="text-[#758BA5] mb-4">
              We believe that talent should be measured by potential, skills,
              and capabilities, not by traditional, often biased recruitment
              methods.
            </p>
            <p className="text-[#758BA5]">
              HireTrack&apos;s AI-powered platform provides comprehensive
              assessments that give both candidates and employers a more
              holistic view of professional capabilities.
            </p>
          </div>
          <div className="bg-[#EFF6FF] rounded-xl p-8">
            <div className="flex items-center mb-6">
              <Target className="w-12 h-12 text-[#3684DB] mr-4" />
              <h3 className="text-2xl font-semibold text-[#223A59]">
                Key Objectives
              </h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-[#3684DB] mr-3 mt-1" />
                <span className="text-[#758BA5]">
                  Reduce hiring bias through AI-driven assessments
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-[#3684DB] mr-3 mt-1" />
                <span className="text-[#758BA5]">
                  Provide candidates with meaningful skill evaluation
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-[#3684DB] mr-3 mt-1" />
                <span className="text-[#758BA5]">
                  Create a transparent and efficient hiring ecosystem
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-[#031930] py-20 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Our Journey</h2>
            <p className="mt-4 text-[#B3D6F9]">
              Transforming recruitment, one innovative step at a time
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="bg-[#223A59] p-8 rounded-xl hover:shadow-xl transition-all duration-300"
              >
                <div className="w-20 h-20 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-6">
                  {milestone.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  {milestone.title}
                </h3>
                <p className="text-[#B3D6F9]">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#223A59] to-[#3684DB] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold">
            Ready to Experience the Future of Hiring?
          </h2>
          <p className="mt-6 text-xl max-w-3xl mx-auto">
            Whether you&apos;re a candidate looking to showcase your skills or
            an employer seeking top talent, HireTrack is your trusted AI-powered
            recruitment partner.
          </p>
          <div className="flex flex-col sm:flex-row justify-center mt-10 gap-4">
            <Link
              href="/form"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold bg-white text-[#3684DB] rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold bg-[#031930] text-white rounded-lg hover:bg-[#0A2340] transition-all duration-300 shadow-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
