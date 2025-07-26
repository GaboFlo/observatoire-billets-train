import { Train } from "lucide-react";

const LoadingAnimation = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative w-64 h-16 mx-auto">
          {/* Train animation container */}
          <div className="absolute inset-0 flex items-center">
            {/* Train icon that moves */}
            <div className="animate-train-move">
              <Train className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          {/* Tracks */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 rounded-full">
            <div className="h-full bg-blue-500 rounded-full animate-train-progress"></div>
          </div>
        </div>
        
        {/* Loading text with dots animation */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">
            Chargement des données
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation; 