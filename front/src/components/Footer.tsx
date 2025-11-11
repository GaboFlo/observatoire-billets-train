import { Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container px-4 py-8 mx-auto max-w-7xl text-center text-sm">
        <p className="inline-flex items-center justify-center gap-1.5 flex-wrap">
          <span>
            © {currentYear} Observatoire des billets de train. Tous droits
            réservés -
          </span>
          <a
            href="https://github.com/GaboFlo/observatoire-billets-train"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
          >
            <Github className="h-4 w-4 flex-shrink-0" />
            <span>GaboFlo</span>
          </a>
        </p>
        <p className="mt-2">
          Les données présentées sont fournies à titre informatif et peuvent
          être incomplètes ou sujettes à des erreurs. <br />
          Projet indépendant et non affilié à SNCF ou autre entreprise de
          transport.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
