import React from "react";
import Link from "next/link";
import { Briefcase, Code, Users, Info } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-[#031930] to-[#3684DB] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-8 h-8" />
            <h1 className="text-2xl font-bold">HireTrack</h1>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-1 hover:text-[#B3D6F9] transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Assessments</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center space-x-1 hover:text-[#B3D6F9] transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center space-x-1 hover:text-[#B3D6F9] transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Contact</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
