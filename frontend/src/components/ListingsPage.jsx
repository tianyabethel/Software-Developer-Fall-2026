import { useEffect, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "./PropertyCard";

export default function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      setLoading(true);
      setError("");

      try {
        const params = { limit: 20, offset: 0 };
        if (city) params.city = city;

        const data = await fetchProperties(params);

        if (!cancelled) {
          setProperties(Array.isArray(data.results) ? data.results : []);
          setTotal(Number(data.total) || 0);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load properties.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProperties();
    return () => { cancelled = true; };
  }, [city]);

  function handleSearch(event) {
    event.preventDefault();
    setCity(cityInput.trim());
  }

  return (
    <main className="listings-page">
      <header className="listings-header">
        <p className="eyebrow">PROPERTY SEARCH</p>
        <h1>Find your next home</h1>
        <p className="listings-subtitle">
          Explore available property listings.
        </p>
      </header>

      <form onSubmit={handleSearch} className="search-form">
        <input
          aria-label="Search by city"
          placeholder="Enter a city, e.g. Blythe"
          value={cityInput}
          onChange={(event) => setCityInput(event.target.value)}
        />
        <button type="submit">Search</button>
        <button
          type="button"
          onClick={() => {
            setCityInput("");
            setCity("");
          }}
        >
          Clear
        </button>
      </form>

      {loading && <p className="status-message" role="status">Loading properties…</p>}

      {!loading && error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="property-count">
            Showing {properties.length} of {total.toLocaleString()} properties
          </p>
          {properties.length === 0 ? (
            <p>No properties found.</p>
          ) : (
            <section className="property-grid" aria-label="Property listings">
              {properties.map((property, index) => (
                <PropertyCard
                  key={property.L_ListingID || property.id || index}
                  property={property}
                />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}