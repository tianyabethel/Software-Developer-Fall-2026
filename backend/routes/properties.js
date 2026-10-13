const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      city,
      zipcode,
      minPrice,
      maxPrice,
      beds,
      baths,
      limit = 20,
      offset = 0,
    } = req.query;

    // Validate limit
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      return res.status(400).json({
        error: "limit must be an integer between 1 and 100",
      });
    }

    // Validate offset
    const parsedOffset = Number(offset);
    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        error: "offset must be a non-negative integer",
      });
    }

    // Validate numeric filters
    const numericFilters = [
      ["minPrice", minPrice],
      ["maxPrice", maxPrice],
      ["beds", beds],
      ["baths", baths],
    ];

    for (const [name, value] of numericFilters) {
      if (value !== undefined && (value === "" || !Number.isFinite(Number(value)))) {
        return res.status(400).json({
          error: `${name} must be a valid number`,
        });
      }
    }

    const conditions = [];
    const values = [];

    if (city !== undefined) {
      if (!city.trim()) {
        return res.status(400).json({
          error: "city cannot be empty",
        });
      }

      conditions.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
      values.push(city);
    }

    if (zipcode !== undefined) {
      if (!zipcode.trim()) {
        return res.status(400).json({
          error: "zipcode cannot be empty",
        });
      }

      conditions.push("L_Zip = ?");
      values.push(zipcode);
    }

    if (minPrice !== undefined) {
      conditions.push("L_SystemPrice >= ?");
      values.push(Number(minPrice));
    }

    if (maxPrice !== undefined) {
      conditions.push("L_SystemPrice <= ?");
      values.push(Number(maxPrice));
    }

    if (beds !== undefined) {
      conditions.push("L_Keyword2 >= ?");
      values.push(Number(beds));
    }

    if (baths !== undefined) {
      conditions.push("LM_Dec_3 >= ?");
      values.push(Number(baths));
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM rets_property
      ${whereClause}
    `;

    const [countRows] = await pool.query(countQuery, values);
    const total = countRows[0].total;

    const propertiesQuery = `
      SELECT *
      FROM rets_property
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    const propertyValues = [...values, parsedLimit, parsedOffset];

    const [results] = await pool.query(
      propertiesQuery,
      propertyValues
    );

    res.json({
      total,
      limit: parsedLimit,
      offset: parsedOffset,
      results,
    });
  } catch (error) {
    console.error("Property search failed:", error.message);

    res.status(500).json({
      error: "Failed to retrieve properties",
    });
  }
});
// GET /api/properties/:id
// GET /api/properties/:id/openhouses
router.get("/:id/openhouses", async (req, res) => {
  const { id } = req.params;

  if (!id || id.length > 50 || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return res.status(400).json({ error: "Invalid listing ID" });
  }

  try {
    const [properties] = await pool.query(
      "SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?",
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    const [openhouses] = await pool.query(
      "SELECT * FROM rets_openhouse WHERE L_ListingID = ? ORDER BY OpenHouseDate ASC, OH_StartTime ASC",
      [id]
    );

    return res.json(openhouses);
  } catch (error) {
    console.error("Open houses lookup failed:", error.message);
    return res.status(500).json({ error: "Failed to retrieve open houses" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || id.length > 50 || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return res.status(400).json({ error: "Invalid listing ID" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM rets_property WHERE L_ListingID = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Property lookup failed:", error.message);
    res.status(500).json({ error: "Failed to retrieve property" });
  }
});
module.exports = router;
