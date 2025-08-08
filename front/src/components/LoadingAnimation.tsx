import { Train, TrendingUp } from "lucide-react";

const LoadingAnimation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo animé */}
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6 animate-pulse">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Train animation container */}
        <div className="relative w-80 h-20 mx-auto">
          {/* Train icon that moves */}
          <div className="absolute inset-0 flex items-center">
            <div className="animate-train-move">
              <Train className="h-10 w-10 text-blue-600 drop-shadow-lg" />
            </div>
          </div>
          {/* Tracks */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-train-progress"></div>
          </div>
        </div>

        {/* Loading text with modern design */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Chargement des données
          </h2>

          {/* Modern loading dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
