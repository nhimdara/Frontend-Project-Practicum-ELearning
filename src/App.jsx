import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/AppRoutes";
import useAppSession from "./app/useAppSession";
import useAppTheme from "./app/useAppTheme";
import ScrollToTop from "./components/assets/ScrollToTop";
import FontStyle from "./components/layout/ui/FontStyle";
import GlobalStyles from "./components/layout/ui/GlobalStyles";

const AppContent = () => {
  useAppTheme();
  const session = useAppSession();

  return <AppRoutes {...session} />;
};

const App = () => (
  <BrowserRouter>
    <FontStyle />
    <GlobalStyles />
    <ScrollToTop />
    <AppContent />
  </BrowserRouter>
);

export default App;
