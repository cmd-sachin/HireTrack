"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  Code,
  Brain,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import hireTrackBg from "./hiretrack-bg.jpg";
import Navbar from "./components/NavBar";

export default function Home() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-[#3684DB]" />,
      title: "Aptitude Assessment",
      description:
        "Comprehensive aptitude tests to evaluate candidate potential",
    },
    {
      icon: <Code className="w-8 h-8 text-[#3684DB]" />,
      title: "Coding Challenges",
      description: "Real-world coding problems to assess technical skills",
    },
    {
      icon: <Users className="w-8 h-8 text-[#3684DB]" />,
      title: "AI-Powered Interviews",
      description: "One-on-one HR-like interviews with advanced AI",
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-[#3684DB]" />,
      title: "Instant Results",
      description: "Get detailed candidate assessment reports immediately",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-[#031930]/90 to-[#223A59]/80 z-10" />
        <Image
          src={hireTrackBg}
          alt="Professional hiring background"
          className="object-cover"
          fill
          priority
        />
        <div className="relative z-20 h-full flex flex-col items-center justify-center">
          <div className="px-4 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white text-center leading-tight">
              Your Career Journey Starts Here
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-[#B3D6F9] text-center max-w-3xl mx-auto">
              Showcase your skills, ace your interviews, and land your dream job
              with HireTrack
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/form"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-[#3684DB] text-white rounded-lg hover:bg-[#2D6FC0] transition-all duration-300 shadow-lg"
              >
                Wanna Get Hired?
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/employers"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-[#031930] rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                For Employers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-[#F5F9FF] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#031930]">
            Say Goodbye to Traditional Hiring
          </h2>
          <p className="mt-4 text-lg text-[#758BA5] max-w-3xl mx-auto">
            HireTrack uses advanced AI to simulate the entire hiring process,
            from aptitude testing to technical interviews, giving you valuable
            experience and employers verified results.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#031930]">How It Works</h2>
          <p className="mt-4 text-lg text-[#758BA5]">
            Our comprehensive platform removes bias and focuses on skills that
            matter
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 border border-[#D1DDED]"
            >
              <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#223A59] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#758BA5]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#031930] py-20 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">
              Trusted by Candidates and Companies
            </h2>
            <p className="mt-4 text-[#B3D6F9]">
              Join thousands who have advanced their careers with HireTrack
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-[#223A59] p-8 rounded-xl">
              <div className="text-5xl font-bold text-[#3684DB] mb-2">
                5,000+
              </div>
              <div className="text-[#B3D6F9]">Candidates Assessed</div>
            </div>
            <div className="bg-[#223A59] p-8 rounded-xl">
              <div className="text-5xl font-bold text-[#3684DB] mb-2">500+</div>
              <div className="text-[#B3D6F9]">Partner Companies</div>
            </div>
            <div className="bg-[#223A59] p-8 rounded-xl">
              <div className="text-5xl font-bold text-[#3684DB] mb-2">95%</div>
              <div className="text-[#B3D6F9]">Hiring Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#031930] text-center mb-16">
            Success Stories
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#F5F9FF] p-8 rounded-xl border border-[#D1DDED]">
              <p className="text-[#758BA5] italic mb-6">
                &quot;HireTrack&apos;s assessment platform helped me identify my
                strengths and weaknesses before actual interviews. I landed a
                job at a top tech company within 2 weeks!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#3684DB] rounded-full flex items-center justify-center text-white font-bold">
                  JS
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-[#223A59]">John Smith</div>
                  <div className="text-sm text-[#758BA5]">
                    Software Engineer at TechCorp
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#F5F9FF] p-8 rounded-xl border border-[#D1DDED]">
              <p className="text-[#758BA5] italic mb-6">
                &quot;As a hiring manager, HireTrack has transformed our
                recruitment process. The AI-powered interviews save us countless
                hours while providing reliable candidate insights.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#3684DB] rounded-full flex items-center justify-center text-white font-bold">
                  AM
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-[#223A59]">
                    Amanda Miller
                  </div>
                  <div className="text-sm text-[#758BA5]">
                    HR Director at InnovateX
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#223A59] to-[#3684DB] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold">Ready to Showcase Your Skills?</h2>
          <p className="mt-6 text-xl max-w-3xl mx-auto">
            Take the first step toward your dream career with HireTrack&apos;s
            AI-powered assessments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center mt-10 gap-4">
            <Link
              href="/form"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold bg-white text-[#3684DB] rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Start Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold bg-[#031930] text-white rounded-lg hover:bg-[#0A2340] transition-all duration-300 shadow-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#F5F9FF] py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-8 h-8 text-[#3684DB]" />
                <h1 className="text-2xl font-bold text-[#031930]">HireTrack</h1>
              </div>
              <p className="text-[#758BA5]">
                Revolutionizing the hiring process with AI-powered assessments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#223A59] mb-4">
                For Candidates
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/assessment"
                    className="text-[#758BA5] hover:text-[#3684DB]"
                  >
                    Assessments
                  </Link>
                </li>
                <li>
                  <Link
                    href="/interview"
                    className="text-[#758BA5] hover:text-[#3684DB]"
                  >
                    Mock Interviews
                  </Link>
                </li>
                <li>
                  <Link
                    href="/progress"
                    className="text-[#758BA5] hover:text-[#3684DB]"
                  >
                    Track Progress
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#223A59] mb-4">
                For Employers
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/solutions"
                    className="text-[#758BA5] hover:text-[#3684DB]"
                  >
                    Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-[#758BA5] hover:text-[#3684DB]"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/enterprise"
                    className="text-[#758BA5] hover:text-[#3684DB]"
                  >
                    Enterprise
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#223A59] mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-[#758BA5] hover:text-[#3684DB]"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-[#758BA5] hover:text-[#3684DB]"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-[#758BA5] hover:text-[#3684DB]"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#D1DDED] pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#758BA5]">
              © 2025 HireTrack. All Rights Reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-[#758BA5] hover:text-[#3684DB]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[#758BA5] hover:text-[#3684DB]"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
