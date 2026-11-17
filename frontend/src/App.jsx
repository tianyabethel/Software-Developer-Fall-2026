import { useEffect, useState } from "react";
import ListingsPage from "./components/ListingsPage";
import PropertyDetailPage from "./components/PropertyDetailPage";
import "./App.css";

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleSelectProperty(id) {
    if (!id) return;
    const nextPath = `/property/${encodeURIComponent(id)}`;
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo(0, 0);
  }

  function handleBack() {
    window.history.pushState({}, "", "/");
    setPath("/");
    window.scrollTo(0, 0);
  }

  const match = path.match(/^\/property\/([^/]+)$/);

  if (match) {
    return (
      <PropertyDetailPage
        propertyId={decodeURIComponent(match[1])}
        onBack={handleBack}
      />
    );
  }

  if (path !== "/") {
    return (
      <main className="listings-page">
        <h1>Page not found</h1>
        <button onClick={handleBack}>Back to listings</button>
      </main>
    );
  }

  return <ListingsPage onSelectProperty={handleSelectProperty} />;
}
