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

// Liquid Glass surface — mimics macOS 26's frosted, light-catching glass:
// a blurred translucent fill, a hairline border, a bright edge-highlight
// along the top (light hitting the rim of the glass), and a soft ambient
// glow tucked in one corner.
const GlassPanel = ({ className = "", children }) => (
  <div
    className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] ${className}`}
  >
    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
    <div className="relative">{children}</div>
  </div>
);

// Accent colors — pulled from the same background blobs (indigo, purple,
// cyan, fuchsia) so the palette stays coherent. All solid, no opacity,
// so text stays bright and readable on the dark glass.
const contactAccents = [
  { icon: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-400/20" },
  { icon: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-400/20" },
  { icon: "text-fuchsia-300", bg: "bg-fuchsia-500/10", border: "border-fuchsia-400/20" },
];

const quickLinkDots = [
  "bg-indigo-400",
  "bg-purple-400",
  "bg-cyan-400",
  "bg-fuchsia-400",
  "bg-violet-400",
  "bg-pink-400",
];

const resourceIconColors = ["text-indigo-300", "text-purple-300", "text-cyan-300", "text-fuchsia-300"];

const legalHovers = ["hover:text-cyan-300", "hover:text-purple-300", "hover:text-fuchsia-300"];

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
      {/* Ambient liquid background — this is the color/light the glass panels refract */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pt-24 pb-12">
          {/* Brand Column */}
          <GlassPanel className="lg:col-span-2 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4 group">
              <div className="relative">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl group-hover:shadow-xl group-hover:shadow-indigo-500/40 group-hover:scale-110 transition-all duration-300">
                  <img
                    src={logo}
                    alt="Elearning Logo"
                    className="w-full h-full absolute left-1"
                  />
                </div>
                <div className="absolute -inset-1 bg-indigo-400/20 rounded-full blur-md group-hover:bg-indigo-400/30 transition-all" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                ELearning
              </span>
            </div>

            <p className="text-indigo-100 mb-6 leading-relaxed">
              Empowering learners worldwide with quality education, expert-led
              courses, and a supportive community. Join us in shaping the future
              of learning.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              {contactInfo.map((item, index) => {
                const accent = contactAccents[index % contactAccents.length];
                return (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center gap-3 text-gray-100 hover:text-white transition-colors group"
                  >
                    <div
                      className={`p-2 rounded-full ${accent.bg} border ${accent.border} backdrop-blur-sm group-hover:bg-white/15 group-hover:border-white/20 transition-colors`}
                    >
                      <item.icon className={`h-4 w-4 ${accent.icon}`} />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </a>
                );
              })}
            </div>
          </GlassPanel>

          {/* Quick Links */}
          <GlassPanel className="p-6 sm:p-8">
            <h4 className="text-lg font-semibold mb-4 relative inline-block bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-indigo-400 rounded-full" />
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-indigo-100 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span
                      className={`w-1 h-1 ${quickLinkDots[index % quickLinkDots.length]} rounded-full group-hover:w-2 transition-all`}
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </GlassPanel>

          {/* Resources */}
          <GlassPanel className="p-6 sm:p-8">
            <h4 className="text-lg font-semibold mb-4 relative inline-block bg-gradient-to-r from-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
              Resources
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-purple-400 rounded-full" />
            </h4>
            <ul className="space-y-3">
              {resources.map((resource, index) => {
                const Icon = resource.icon;
                const iconColor = resourceIconColors[index % resourceIconColors.length];
                return (
                  <li key={index}>
                    <a
                      href={resource.href}
                      className="text-purple-100 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                    >
                      <Icon className={`h-4 w-4 ${iconColor} group-hover:scale-110 transition-transform`} />
                      {resource.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </GlassPanel>

          {/* Social & Legal */}
          <GlassPanel className="p-6 sm:p-8">
            <h4 className="text-lg font-semibold mb-4 relative inline-block bg-gradient-to-r from-cyan-300 to-sky-300 bg-clip-text text-transparent">
              Connect With Us
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-cyan-400 rounded-full" />
            </h4>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 mb-6">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`relative p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:scale-110 hover:border-white/25 transition-all duration-300 hover:text-white ${social.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            {/* Legal Links */}
            <div className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((label, index) => (
                <a
                  key={label}
                  href="#"
                  className={`text-sm text-cyan-100 ${legalHovers[index % legalHovers.length]} transition-colors block`}
                >
                  {label}
                </a>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Bottom Bar — a slim glass strip, like a macOS menu bar */}
        <div className="pb-8">
          <GlassPanel className="rounded-full px-6 py-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-indigo-200">
                &copy; {currentYear} EduLearn. All rights reserved.
              </p>

              <div className="flex items-center gap-4">
                <span className="text-sm text-cyan-100 flex items-center gap-1">
                  Made with{" "}
                  <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />{" "}
                  in Cambodia
                </span>

                <select
                  className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="kh">ភាសាខ្មែរ</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </footer>
  );
};

export default Footer;