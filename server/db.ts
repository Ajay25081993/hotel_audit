import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Resolver } from 'dns/promises';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const connectionString = process.env.DATABASE_URL;

// Parse the URL so we can resolve the hostname independently.
// Local ISP DNS (Reliance) refuses to resolve *.neon.tech hostnames;
// we fall back to Google DNS (8.8.8.8) to get the real IP and pass it
// as the host while keeping the original hostname for SSL SNI.
const parsed = new URL(connectionString);
const hostname = parsed.hostname;

async function resolveHost(host: string): Promise<string> {
  try {
    const resolver = new Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    const ips = await resolver.resolve4(host);
    if (ips.length > 0) {
      console.log(`[DB] Resolved ${host} → ${ips[0]} (via Google DNS)`);
      return ips[0];
    }
  } catch {
    // DNS resolution via Google failed; fall through to original hostname
  }
  return host;
}

const resolvedIp = await resolveHost(hostname);

// Extract individual connection params so we can pass the resolved IP
// as `host` while keeping the original hostname as the SSL SNI servername.
const ssl = parsed.searchParams.get('sslmode') === 'require'
  ? { servername: hostname }
  : false;

const sql = postgres({
  host: resolvedIp,
  port: Number(parsed.port) || 5432,
  database: parsed.pathname.replace(/^\//, ''),
  username: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  ssl,
  max: 10,
  idle_timeout: 30,
});

export const db = drizzle(sql);
