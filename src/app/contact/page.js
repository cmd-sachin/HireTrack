"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, ArrowRight } from "lucide-react";
import Navbar from "../components/NavBar";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for form submission logic
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We will get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#F5F9FF] py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-[#031930] mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-[#758BA5] max-w-3xl mx-auto">
            Have questions about HireTrack? We&apos;re here to help. Reach out
            to our team for support, partnership inquiries, or technical
            assistance.
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="bg-[#EFF6FF] p-8 rounded-xl">
            <Mail className="w-12 h-12 text-[#3684DB] mb-4" />
            <h3 className="text-2xl font-semibold text-[#223A59] mb-4">
              Email
            </h3>
            <p className="text-[#758BA5] mb-4">
              We aim to respond within 24 hours
            </p>
            <a
              href="mailto:support@hiretrack.com"
              className="text-[#3684DB] hover:underline"
            >
              support@hiretrack.com
            </a>
          </div>
          <div className="bg-[#EFF6FF] p-8 rounded-xl">
            <Phone className="w-12 h-12 text-[#3684DB] mb-4" />
            <h3 className="text-2xl font-semibold text-[#223A59] mb-4">
              Phone
            </h3>
            <p className="text-[#758BA5] mb-4">
              Customer support available 9 AM - 6 PM EST
            </p>
            <a
              href="tel:+18005551234"
              className="text-[#3684DB] hover:underline"
            >
              +1 (800) 555-1234
            </a>
          </div>
          <div className="bg-[#EFF6FF] p-8 rounded-xl">
            <MapPin className="w-12 h-12 text-[#3684DB] mb-4" />
            <h3 className="text-2xl font-semibold text-[#223A59] mb-4">
              Address
            </h3>
            <p className="text-[#758BA5]">
              123 AI Innovation Drive
              <br />
              Tech City, CA 94000
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-[#031930] py-20 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Send Us a Message</h2>
            <p className="text-[#B3D6F9]">
              Fill out the form below, and our team will get back to you shortly
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-[#223A59] p-10 rounded-xl"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-[#B3D6F9] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0A2340] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3684DB]"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-[#B3D6F9] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0A2340] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3684DB]"
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="phone" className="block text-[#B3D6F9] mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[#0A2340] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3684DB]"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="message" className="block text-[#B3D6F9] mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-[#0A2340] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3684DB]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center w-full px-6 py-4 text-lg font-semibold bg-[#3684DB] text-white rounded-lg hover:bg-[#2D6FC0] transition-all duration-300 shadow-lg"
            >
              Send Message
              <Send className="ml-2 w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#223A59] to-[#3684DB] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold">Need More Information?</h2>
          <p className="mt-6 text-xl max-w-3xl mx-auto">
            Check out our comprehensive resources or schedule a personalized
            consultation to learn how HireTrack can transform your hiring
            process.
          </p>
          <div className="flex flex-col sm:flex-row justify-center mt-10 gap-4">
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold bg-white text-[#3684DB] rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Learn More
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/employers"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold bg-[#031930] text-white rounded-lg hover:bg-[#0A2340] transition-all duration-300 shadow-lg"
            >
              Employer Solutions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
