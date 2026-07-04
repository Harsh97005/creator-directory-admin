const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store, seeded from disk. Resets on server restart by design —
// this is a mock API for local development, not a persistence layer.
let creators = require("./seed.json");

const NICHES = ["beauty", "fitness", "travel", "food", "tech", "fashion"];
const STATUSES = ["active", "inactive"];
const SORTABLE_FIELDS = ["followerCount", "engagementRate", "name", "createdAt"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCreatorPayload(body, { partial = false } = {}) {
  const errors = [];
  const required = (key) => !partial && (body[key] === undefined || body[key] === "");

  if (required("name") || (body.name !== undefined && String(body.name).trim() === "")) {
    errors.push("name is required");
  }
  if (required("email")) errors.push("email is required");
  if (body.email !== undefined && !EMAIL_RE.test(body.email)) {
    errors.push("email must be a valid email address");
  }
  if (required("niche")) errors.push("niche is required");
  if (body.niche !== undefined && !NICHES.includes(body.niche)) {
    errors.push(`niche must be one of: ${NICHES.join(", ")}`);
  }
  if (body.followerCount !== undefined) {
    const n = Number(body.followerCount);
    if (Number.isNaN(n) || n < 0) errors.push("followerCount cannot be negative");
  }
  if (body.engagementRate !== undefined) {
    const n = Number(body.engagementRate);
    if (Number.isNaN(n) || n < 0 || n > 100) {
      errors.push("engagementRate must be between 0 and 100");
    }
  }
  if (body.status !== undefined && !STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${STATUSES.join(", ")}`);
  }
  return errors;
}

// Simulate realistic network latency so loading states are actually visible/testable.
app.use((req, res, next) => {
  setTimeout(next, 350 + Math.random() * 300);
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/creators", (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy,
    order = "asc",
    niche,
    minFollowers,
    maxFollowers,
  } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));

  let results = [...creators];

  if (niche && niche !== "all") {
    results = results.filter((c) => c.niche === niche);
  }
  if (minFollowers !== undefined && minFollowers !== "") {
    results = results.filter((c) => c.followerCount >= Number(minFollowers));
  }
  if (maxFollowers !== undefined && maxFollowers !== "") {
    results = results.filter((c) => c.followerCount <= Number(maxFollowers));
  }

  if (sortBy && SORTABLE_FIELDS.includes(sortBy)) {
    results.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      let cmp;
      if (typeof av === "string") {
        cmp = av.localeCompare(bv);
      } else {
        cmp = av - bv;
      }
      return order === "desc" ? -cmp : cmp;
    });
  }

  const total = results.length;
  const start = (pageNum - 1) * limitNum;
  const data = results.slice(start, start + limitNum);

  res.json({ data, total, page: pageNum, limit: limitNum });
});

app.get("/creators/:id", (req, res) => {
  const creator = creators.find((c) => c.id === req.params.id);
  if (!creator) return res.status(404).json({ error: "Creator not found" });
  res.json(creator);
});

app.post("/creators", (req, res) => {
  const errors = validateCreatorPayload(req.body, { partial: false });
  if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

  const creator = {
    id: String(Date.now()),
    name: req.body.name,
    niche: req.body.niche,
    followerCount: Number(req.body.followerCount) || 0,
    engagementRate: Number(req.body.engagementRate) || 0,
    email: req.body.email,
    status: req.body.status || "active",
    createdAt: new Date().toISOString(),
  };
  creators.push(creator);
  res.status(201).json(creator);
});

app.patch("/creators/:id", (req, res) => {
  const idx = creators.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Creator not found" });

  const errors = validateCreatorPayload(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

  creators[idx] = { ...creators[idx], ...req.body, id: creators[idx].id };
  res.json(creators[idx]);
});

app.delete("/creators/:id", (req, res) => {
  const exists = creators.some((c) => c.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Creator not found" });
  creators = creators.filter((c) => c.id !== req.params.id);
  res.status(204).send();
});

// Fallback error handler so a bad request never crashes the process.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});
