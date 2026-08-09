import React from "react";
import AIChat from "../service/AIChat";
import Footer from "./Footer";
import Navbar from "./Navbar";

const PageLayout = ({
  isAuthenticated,
  user,
  onLogout,
  onAuthModalOpen,
  children,
  showAIChat = true,
}) => (
  <div className="nav-font min-h-screen flex flex-col">
    <Navbar
      isAuthenticated={isAuthenticated}
      user={user}
      onLogout={onLogout}
      onAuthModalOpen={onAuthModalOpen}
    />
    <main className="flex-grow">{children}</main>
    <Footer />
    {showAIChat && isAuthenticated && <AIChat />}
  </div>
);

export default PageLayout;
