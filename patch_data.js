const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "lib", "data.ts");
let code = fs.readFileSync(dataPath, "utf-8");

if (!code.includes("import fs from \"fs\"")) {
  code = code.replace('import "server-only"', `import "server-only"
import fs from "fs"
import path from "path"

const DB_PATH = path.join(process.cwd(), ".next", "rioms_db.json")

function persist() {
  if (global._riomsMem) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(global._riomsMem), "utf-8")
    } catch (e) {
      console.error("Failed to save memory to disk:", e)
    }
  }
}`);

  const memFuncOld = `function mem(): MemStore {
  if (!global._riomsMem) {
    global._riomsMem = {
      offices: [...seedOffices],
      transactions: [...seedTransactions],
      tasks: [...seedTasks],
      notifications: [...seedNotifications],
      users: [
        {
          _id: "admin-seed-1",
          name: "System Administrator",
          email: "admin@rioms.com",
          passwordHash: "$2b$10$PDGCza2StvF/G2ZXNzbRkOwi5PF5BFMKoknIjbTzIHcv1vWHmLZOy",
          role: "admin",
          createdAt: new Date().toISOString(),
        }
      ],
      payments: [],
      dailyWorks: [],
      seeded: true,
    }
  }
  return global._riomsMem
}`;

  const memFuncNew = `function mem(): MemStore {
  if (!global._riomsMem) {
    try {
      if (fs.existsSync(DB_PATH)) {
        global._riomsMem = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"))
      }
    } catch (e) {
      console.error("Failed to load memory from disk:", e)
    }

    if (!global._riomsMem) {
      global._riomsMem = {
        offices: [...seedOffices],
        transactions: [...seedTransactions],
        tasks: [...seedTasks],
        notifications: [...seedNotifications],
        users: [
          {
            _id: "admin-seed-1",
            name: "System Administrator",
            email: "admin@rioms.com",
            passwordHash: "$2b$10$PDGCza2StvF/G2ZXNzbRkOwi5PF5BFMKoknIjbTzIHcv1vWHmLZOy",
            role: "admin",
            createdAt: new Date().toISOString(),
          }
        ],
        payments: [],
        dailyWorks: [],
        seeded: true,
      }
      persist()
    }
  }
  return global._riomsMem
}`;

  code = code.replace(memFuncOld, memFuncNew);

  // Now inject persist() into all mutation functions
  const lines = code.split("\n");
  let inMutationFunc = false;
  let braceCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^export async function (create|update|delete|mark)/)) {
      inMutationFunc = true;
      braceCount = 0;
    }
    
    if (inMutationFunc) {
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      
      // If we are about to close the function
      if (braceCount === 0 && line.trim() === "}") {
        // inject persist() just before
        lines.splice(i, 0, "  persist()");
        inMutationFunc = false;
        i++; // skip the newly inserted line
      } else if (braceCount === 0 && line.includes("}")) {
          // just in case it's on the same line, which shouldn't happen with standard formatting
      }
    }
  }

  fs.writeFileSync(dataPath, lines.join("\n"));
}
