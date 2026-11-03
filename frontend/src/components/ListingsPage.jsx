import { useEffect, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "./PropertyCard";
import PropertyFilters from "./PropertyFilters";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 20;

export default function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      setLoading(true);
      setError("");
      setProperties([]);

      try {
        const params = {
          limit: ITEMS_PER_PAGE,
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
          ...filters,
        };

        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(
            ([key, value]) =>
              key === "limit" || key === "offset" || value !== ""
          )
        );

        const data = await fetchProperties(cleanParams);

        if (!cancelled) {
          setProperties(Array.isArray(data.results) ? data.results : []);
          setTotal(Number(data.total) || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load properties.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, [filters, currentPage]);

  function handleSearch(activeFilters) {
    setCurrentPage(1);
    setFilters(activeFilters);
  }

  function handleClear() {
    setCurrentPage(1);
    setFilters({});
  }

  function handlePageChange(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  const startItem = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, total);

  return (
    <main className="listings-page">
      <header className="listings-header">
        <p className="eyebrow">PROPERTY SEARCH</p>
        <h1>Find your next home</h1>
        <p className="listings-subtitle">
          Explore available property listings.
        </p>
      </header>

      <PropertyFilters
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {loading && (
        <p className="status-message" role="status">
          Loading properties...
        </p>
      )}

      {!loading && error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
          <button onClick={() => setCurrentPage((page) => page)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="property-count">
            Showing {startItem}-{endItem} of {total.toLocaleString()} properties
          </p>

          {properties.length === 0 ? (
            <p>No properties found. Try adjusting your filters.</p>
          ) : (
            <>
              <section className="property-grid" aria-label="Property listings">
                {properties.map((property, index) => (
                  <PropertyCard
                    key={property.L_ListingID || property.id || index}
                    property={property}
                  />
                ))}
              </section>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}
