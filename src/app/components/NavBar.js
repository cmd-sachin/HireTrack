import React from "react";
import Link from "next/link";
import { Briefcase, Code, Users, Info } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo Section - Clickable */}
        <Link href="/" className="flex items-center space-x-3 cursor-pointer">
          <Briefcase className="w-7 h-7 text-[#2563EB]" />
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide">
            Hire<span className="text-[#2563EB]">Track</span>
          </h1>
        </Link>

        {/* Links Section */}
        <div className="flex items-center space-x-8">
          <NavLink href="/" icon={Code} label="Assessments" />
          <NavLink href="/about" icon={Info} label="About" />
          <NavLink href="/contact" icon={Users} label="Contact" />
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, icon: Icon, label }) => (
  <Link
    href={href}
    className="flex items-center space-x-2 text-[#475569] hover:text-[#2563EB] transition-colors font-medium text-base relative group"
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#2563EB] transition-all group-hover:w-full"></div>
  </Link>
);

export default Navbar;
