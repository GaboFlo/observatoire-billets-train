
import { Link } from "react-router-dom";
import { Train } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b border-gray-200 py-4 px-6 bg-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Train size={24} className="text-train-500" />
          <span className="font-bold text-xl text-gray-800">Train Ticket Trends</span>
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="text-gray-600 hover:text-train-500 font-medium">
            Vue Globale
          </Link>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            className="text-gray-600 hover:text-train-500 font-medium"
          >
            À Propos
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
