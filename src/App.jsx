import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/AppRoutes";
import useAppSession from "./app/useAppSession";
import useAppTheme from "./app/useAppTheme";
import ScrollToTop from "./components/assets/ScrollToTop";
import FontStyle from "./components/layout/ui/FontStyle";
import GlobalStyles from "./components/layout/ui/GlobalStyles";
import { LanguageProvider } from "./i18n/LanguageContext";

const AppContent = () => {
  const session = useAppSession();
  useAppTheme(session.user);

  return <AppRoutes {...session} />;
};

const App = () => (
  <BrowserRouter>
    <FontStyle />
    <GlobalStyles />
    <ScrollToTop />
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  </BrowserRouter>
);

export default App;
