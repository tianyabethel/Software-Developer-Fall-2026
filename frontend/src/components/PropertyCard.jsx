function getFirstPhoto(value) {
  if (!value) return null;

  try {
    let photos = value;

    // Handle JSON strings, including strings that were JSON-encoded twice.
    for (let i = 0; i < 2 && typeof photos === "string"; i++) {
      photos = JSON.parse(photos);
    }

    if (!Array.isArray(photos)) return null;

    return (
      photos.find(
        (photo) =>
          typeof photo === "string" &&
          /^https?:\/\//i.test(photo.trim())
      )?.trim() || null
    );
  } catch {
    return null;
  }
}

export default function PropertyCard({ property }) {
  const photo = getFirstPhoto(property.L_Photos);
  const address =
    property.L_Address || property.L_AddressStreet || "Address unavailable";

  return (
    <article className="property-card">
      {photo ? (
        <img
          className="property-card__image"
          src={photo}
          alt={address}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="property-card__no-photo">No photo available</div>
      )}

      <div className="property-card__details">
        <h2 className="property-card__price">
          {property.L_SystemPrice != null &&
          property.L_SystemPrice !== ""
            ? Number(property.L_SystemPrice).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })
            : "Price unavailable"}
        </h2>

        <p className="property-card__address">{address}</p>
        <p className="property-card__location">
          {[property.L_City, property.L_State].filter(Boolean).join(", ") ||
            "Location unavailable"}
        </p>

        <div className="property-card__features">
          <span>{property.L_Keyword2 ?? "—"} beds</span>
          <span>{property.LM_Dec_3 ?? "—"} baths</span>
          <span>
  {property.LM_Int2_3 != null && property.LM_Int2_3 !== ""
    ? Number(property.LM_Int2_3).toLocaleString("en-US")
    : "—"} sqft
</span>
        </div>
      </div>
    </article>
  );
}
