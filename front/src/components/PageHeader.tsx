const PageHeader = () => {
  return (
    <div className="mb-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Observatoire des billets de train
        </h1>
        <p className="text-sm text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Analyse des prix des billets de train grandes distances sur certaines
          dates et lignes à origine ou à destination de Paris.
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
