import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "../components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Tu vas plus vite que le TGV, j'ai pas trouvé</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            Revenir à la gare d'accueil
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
