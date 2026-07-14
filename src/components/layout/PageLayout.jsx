import React from "react";
import AIChat from "../service/AIChat";
import Footer from "./Footer";
import Navbar from "./Navbar";
import FontStyle from "./ui/FontStyle";
import GlobalStyles from "./ui/GlobalStyles";

const PageLayout = ({
  isAuthenticated,
  user,
  onLogout,
  onAuthModalOpen,
  children,
  showAIChat = true,
}) => (
  <div className="nav-font min-h-screen flex flex-col">
    <FontStyle />
    <GlobalStyles />
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
