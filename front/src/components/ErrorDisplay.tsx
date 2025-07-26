interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center text-red-500">
          <p>Erreur: {error}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 