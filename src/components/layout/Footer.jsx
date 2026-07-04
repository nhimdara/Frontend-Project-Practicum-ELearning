import React from "react";
import { Link } from "react-router-dom";
import logo from "../../components/assets/image/logo.png";
import {
  GraduationCap,
  Heart,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Globe,
  Award,
  BookOpen,
  Users,
} from "lucide-react";
// Import brand icons from react-icons
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Lessons", path: "/lessons" },
    { name: "Projects", path: "/projects" },
    { name: "Calendar", path: "/calendar" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Profile", path: "/profile" },
  ];

  const resources = [
    { name: "Blog", href: "#", icon: BookOpen },
    { name: "Help Center", href: "#", icon: Users },
    { name: "Community", href: "#", icon: Globe },
    { name: "Certificates", href: "#", icon: Award },
  ];

  const socialLinks = [
    {
      icon: FaFacebook,
      href: "#",
      color: "hover:bg-blue-600",
      label: "Facebook",
    },
    { icon: FaTwitter, href: "#", color: "hover:bg-sky-500", label: "Twitter" },
    {
      icon: FaLinkedin,
      href: "#",
      color: "hover:bg-blue-700",
      label: "LinkedIn",
    },
    { icon: FaYoutube, href: "#", color: "hover:bg-red-600", label: "YouTube" },
    {
      icon: FaInstagram,
      href: "#",
      color: "hover:bg-pink-600",
      label: "Instagram",
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      text: "support@edulearn.com",
      href: "mailto:support@edulearn.com",
    },
    { icon: Phone, text: "+855 12 345 678", href: "tel:+85512345678" },
    { icon: MapPin, text: "Phnom Penh, Cambodia", href: "#" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      {/* Main Footer Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-24 pb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 group">
              <div className="relative">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl group-hover:shadow-xl group-hover:shadow-indigo-500/40 group-hover:scale-110 transition-all duration-300">
                  <img
                    src={logo}
                    alt="LearnFlow Logo"
                    className="w-full h-full absolute left-1"
                  />
                </div>
                <div className="absolute -inset-1 bg-indigo-400/20 rounded-full blur-md group-hover:bg-indigo-400/30 transition-all" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                ELearning
              </span>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering learners worldwide with quality education, expert-led
              courses, and a supportive community. Join us in shaping the future
              of learning.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 relative inline-block">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-indigo-400 rounded-full" />
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-indigo-400 rounded-full group-hover:w-2 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 relative inline-block">
              Resources
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-indigo-400 rounded-full" />
            </h4>
            <ul className="space-y-3">
              {resources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <li key={index}>
                    <a
                      href={resource.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                    >
                      <Icon className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                      {resource.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Social & Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4 relative inline-block">
              Connect With Us
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-indigo-400 rounded-full" />
            </h4>

            {/* Social Links */}
            <div className="flex gap-2 mb-6">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`p-3 rounded-xl bg-white/5 hover:scale-110 transition-all duration-300 hover:text-white ${social.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            {/* Legal Links */}
            <div className="space-y-2">
              <a
                href="#"
                className="text-sm text-gray-300 hover:text-white transition-colors block"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-300 hover:text-white transition-colors block"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-gray-300 hover:text-white transition-colors block"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} EduLearn. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 flex items-center gap-1">
                Made with{" "}
                <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />{" "}
                in Cambodia
              </span>

              <select
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="kh">ភាសាខ្មែរ</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;