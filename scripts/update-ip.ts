import os from "os"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nets = os.networkInterfaces()
let localIP: string | null = null

for (const name of Object.keys(nets)) {
  for (const net of nets[name] || []) {
    if (net.family === "IPv4" && !net.internal) {
      localIP = net.address
    }
  }
}

if (!localIP) {
  console.error("No local IP found")
  process.exit(1)
}

console.log("Local IP:", localIP)

const files = [".env.development"]

files.forEach(file => {
  const filePath = path.join(__dirname, "..", file)
  if (!fs.existsSync(filePath)) return

  let content = fs.readFileSync(filePath, "utf8")

  content = content.replace(
    /VITE_API_URL=.*/g,
    `VITE_API_URL=http://${localIP}:8000`
  )

  fs.writeFileSync(filePath, content, "utf8")
  console.log(`${file} updated`)
})

const backendEnvPath = path.join(__dirname, "..", ".env.local-ip")
fs.writeFileSync(backendEnvPath, `LOCAL_IP=${localIP}\n`)

console.log(".env.local-ip updated")
