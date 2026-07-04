// One-off script: `node generate-seed.js` regenerates seed.json.
// Not required at server runtime — seed.json is committed and loaded directly.
const fs = require("fs");
const path = require("path");

const firstNames = [
  "Priya", "Rahul", "Ananya", "Karan", "Sneha", "Arjun", "Ishita", "Vikram",
  "Neha", "Aditya", "Kavya", "Rohan", "Meera", "Siddharth", "Pooja", "Aman",
  "Divya", "Nikhil", "Ritu", "Varun", "Shreya", "Aarav", "Tanya", "Yash",
  "Nandini", "Devansh", "Aisha", "Manav", "Riya", "Kabir", "Simran", "Harsh",
  "Zoya", "Rajat", "Anjali", "Sameer", "Kritika", "Ayaan", "Diya", "Vivek",
];

const lastNames = [
  "Sharma", "Verma", "Iyer", "Mehta", "Kapoor", "Nair", "Reddy", "Gupta",
  "Khanna", "Bose", "Chatterjee", "Malhotra", "Rao", "Joshi", "Bhatt",
  "Chopra", "Desai", "Menon", "Pillai", "Agarwal",
];

const niches = ["beauty", "fitness", "travel", "food", "tech", "fashion"];

// Simple seeded PRNG so the dataset is reproducible.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const creators = [];
const usedNames = new Set();

for (let i = 1; i <= 40; i++) {
  let name;
  do {
    name = `${pick(firstNames)} ${pick(lastNames)}`;
  } while (usedNames.has(name));
  usedNames.add(name);

  const niche = pick(niches);
  const followerCount = Math.floor(1000 + rand() * 499000);
  const engagementRate = Math.round((0.5 + rand() * 9.5) * 10) / 10;
  const status = rand() > 0.22 ? "active" : "inactive";
  const daysAgo = Math.floor(rand() * 220);
  const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
  const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;

  creators.push({
    id: String(i),
    name,
    niche,
    followerCount,
    engagementRate,
    email,
    status,
    createdAt,
  });
}

fs.writeFileSync(
  path.join(__dirname, "seed.json"),
  JSON.stringify(creators, null, 2) + "\n"
);

console.log(`Wrote ${creators.length} creators to seed.json`);
