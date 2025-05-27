import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./Routes";

const App = () => {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;
