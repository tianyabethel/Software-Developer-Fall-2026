import { useEffect, useState } from "react";
import { fetchPropertyDetail, fetchOpenHouses } from "../api/client";

function parsePhotos(value) {
  try {
    let result = value;
    for (let i = 0; i < 2 && typeof result === "string"; i++) {
      result = JSON.parse(result);
    }
    if (!Array.isArray(result)) return [];
    return result.filter(
      (photo) => typeof photo === "string" && /^https?:\/\//i.test(photo)
    );
  } catch {
    return [];
  }
}

function parseData(value) {
  if (!value) return {};
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return {};
  }
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(`2000-01-01T${value}`);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
}

export default function PropertyDetailPage({ propertyId, onBack }) {
  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      setLoading(true);
      setError("");
      try {
        const [propertyData, openHouseData] = await Promise.all([
          fetchPropertyDetail(propertyId),
          fetchOpenHouses(propertyId),
        ]);

        if (!cancelled) {
          setProperty(propertyData);
          setOpenHouses(Array.isArray(openHouseData) ? openHouseData : []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load property.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const photos = parsePhotos(property?.L_Photos);

  function previousPhoto() {
    setPhotoIndex((index) => (index - 1 + photos.length) % photos.length);
  }

  function nextPhoto() {
    setPhotoIndex((index) => (index + 1) % photos.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") previousPhoto();
      if (event.key === "ArrowRight") nextPhoto();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, photos.length]);

  if (loading) {
    return <main className="property-detail"><p role="status">Loading property...</p></main>;
  }

  if (error || !property) {
    return (
      <main className="property-detail">
        <button onClick={onBack}>← Back to listings</button>
        <div className="error-message" role="alert">
          <h1>Property unavailable</h1>
          <p>{error || "Property not found."}</p>
        </div>
      </main>
    );
  }

  const address =
    property.L_Address || property.L_AddressStreet || "Address unavailable";
  const location = [address, property.L_City, property.L_State, property.L_Zip]
    .filter(Boolean)
    .join(", ");
  const mapQuery = encodeURIComponent(location);
  const price =
    property.L_SystemPrice != null
      ? Number(property.L_SystemPrice).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })
      : "Price unavailable";

  return (
    <main className="property-detail">
      <button className="back-button" onClick={onBack}>
        ← Back to listings
      </button>

      <header className="detail-header">
        <p className="eyebrow">PROPERTY DETAILS</p>
        <h1>{price}</h1>
        <h2>{address}</h2>
        <p>{[property.L_City, property.L_State, property.L_Zip].filter(Boolean).join(", ")}</p>
      </header>

      <section className="detail-gallery" aria-label="Property photos">
        {photos.length > 0 ? (
          <>
            <img
              className="detail-main-photo"
              src={photos[photoIndex]}
              alt={`Property photo ${photoIndex + 1}`}
              onClick={() => setLightboxOpen(true)}
            />
            {photos.length > 1 && (
              <div className="gallery-controls">
                <button onClick={previousPhoto}>Previous</button>
                <span>{photoIndex + 1} of {photos.length}</span>
                <button onClick={nextPhoto}>Next</button>
              </div>
            )}
            <button onClick={() => setLightboxOpen(true)}>View gallery</button>
          </>
        ) : (
          <p>No photos available for this property.</p>
        )}
      </section>

      {lightboxOpen && photos.length > 0 && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
          tabIndex={0}
          onClick={() => setLightboxOpen(false)}
        >
          <button onClick={() => setLightboxOpen(false)}>Close ✕</button>
          {photos.length > 1 && (
            <button onClick={(event) => { event.stopPropagation(); previousPhoto(); }}>
              Previous
            </button>
          )}
          <img
            src={photos[photoIndex]}
            alt={`Property photo ${photoIndex + 1}`}
            onClick={(event) => event.stopPropagation()}
          />
          {photos.length > 1 && (
            <button onClick={(event) => { event.stopPropagation(); nextPhoto(); }}>
              Next
            </button>
          )}
        </div>
      )}

      <section className="detail-features">
        <h2>Property Overview</h2>
        <div className="property-card__features">
          <span>{property.L_Keyword2 ?? "—"} beds</span>
          <span>{property.LM_Dec_3 ?? "—"} baths</span>
          <span>{property.LM_Int2_3 ?? "—"} sqft</span>
        </div>
        {property.L_Remarks && <p>{property.L_Remarks}</p>}
      </section>

      <section className="detail-map">
        <h2>Location</h2>
        <iframe
          title="Property location map"
          width="100%"
          height="350"
          loading="lazy"
          src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
        />
        <p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
            target="_blank"
            rel="noreferrer"
          >
            Get directions
          </a>
        </p>
      </section>

      <section className="detail-open-houses">
        <h2>Open Houses</h2>
        {openHouses.length === 0 ? (
          <p>No open houses scheduled</p>
        ) : (
          openHouses.map((house, index) => {
            const extraData = parseData(house.all_data);
            const remarks =
              extraData.OpenHouseRemarks ||
              house.OpenHouseRemarks ||
              "";

            return (
              <article className="open-house-card" key={house.id || index}>
                <h3>{formatDate(house.OpenHouseDate)}</h3>
                <p>
                  {formatTime(house.OH_StartTime)}
                  {house.OH_EndTime ? ` – ${formatTime(house.OH_EndTime)}` : ""}
                </p>
                {remarks && <p>{remarks}</p>}
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
