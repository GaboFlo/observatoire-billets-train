import { useEffect } from "react";

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, unknown>;
}

const updateMetaTag = (name: string, content: string, attribute = "content") => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const updateLinkTag = (rel: string, href: string) => {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

const updateJsonLd = (data: Record<string, unknown>) => {
  let script = document.querySelector('script[type="application/ld+json"][data-dynamic="true"]');
  if (!script) {
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    if (existingScripts.length > 0) {
      existingScripts.forEach((s) => s.remove());
    }
    script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-dynamic", "true");
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

export const useSEO = (seoData: SEOData) => {
  useEffect(() => {
    if (seoData.title) {
      document.title = seoData.title;
    }

    if (seoData.description) {
      updateMetaTag("description", seoData.description);
    }

    if (seoData.keywords) {
      updateMetaTag("keywords", seoData.keywords);
    }

    if (seoData.ogTitle) {
      updateMetaTag("og:title", seoData.ogTitle, "property");
    }

    if (seoData.ogDescription) {
      updateMetaTag("og:description", seoData.ogDescription, "property");
    }

    if (seoData.ogImage) {
      updateMetaTag("og:image", seoData.ogImage, "property");
    }

    if (seoData.ogUrl) {
      updateMetaTag("og:url", seoData.ogUrl, "property");
    }

    if (seoData.twitterTitle) {
      updateMetaTag("twitter:title", seoData.twitterTitle);
    }

    if (seoData.twitterDescription) {
      updateMetaTag("twitter:description", seoData.twitterDescription);
    }

    if (seoData.canonicalUrl) {
      updateLinkTag("canonical", seoData.canonicalUrl);
    }

    if (seoData.jsonLd) {
      updateJsonLd(seoData.jsonLd);
    }
  }, [seoData]);
};

