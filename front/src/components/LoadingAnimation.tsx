import React from "react";

interface LoadingAnimationProps {
  isFilterLoading?: boolean; // Nouvelle prop pour la barre de chargement discrète
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  isFilterLoading = false,
}) => {
  if (isFilterLoading) {
    // Barre de chargement discrète pour les filtres
    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
      </div>
    );
  }

  // Animation de chargement complète pour le chargement initial
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Chargement des données...
        </h2>
        <p className="text-gray-500">
          Récupération des informations de prix des trains
        </p>
      </div>
    </div>
  );
};

export default LoadingAnimation;
