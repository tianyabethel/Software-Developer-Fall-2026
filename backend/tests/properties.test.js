require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const test = require("node:test");
const assert = require("node:assert/strict");

const pool = require("../db");

test("minPrice + beds returns the correct total", async () => {
  const response = await fetch(
    "http://localhost:5000/api/properties?minPrice=300000&beds=3&limit=5"
  );

  assert.equal(response.status, 200);

  const body = await response.json();

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM rets_property
     WHERE L_SystemPrice >= ?
       AND L_Keyword2 >= ?`,
    [300000, 3]
  );

  assert.equal(Number(body.total), Number(rows[0].total));
  assert.equal(body.results.length, 5);
});

test("invalid limit returns 400", async () => {
  const response = await fetch(
    "http://localhost:5000/api/properties?limit=0"
  );

  assert.equal(response.status, 400);
});

test("invalid minPrice returns 400", async () => {
  const response = await fetch(
    "http://localhost:5000/api/properties?minPrice=abc"
  );

  assert.equal(response.status, 400);
});

test.after(async () => {
  await pool.end();
});
