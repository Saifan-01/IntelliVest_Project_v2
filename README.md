NetAssist Network Assistant — Intelligent Network Operations & Incident Response Platform 🌐

NetAssist Network Assistant is a modern, full-stack Network Operations Center (NOC) dashboard built to simulate a real-world enterprise network environment. It continuously monitors devices, generates incident tickets on failures, and provides structured troubleshooting guidance based on predefined logic and system rules.

Features
Real-Time Network Monitoring: Track the status, latency, packet loss, and uptime of simulated network devices such as routers, servers, and switches.
Automated Incident Ticketing: Automatically generates tickets with severity levels when a device fails or experiences performance degradation.
Troubleshooting Assistant: Provides step-by-step diagnostic suggestions based on predefined rules and log analysis.
Log Management System: Complete timeline of system and network events with severity-based filtering.
Network Topology Map: Visual representation of network nodes with instant failure highlighting.
Analytics Dashboard: Interactive charts showing incidents, resolution trends, and device uptime statistics.
Role-Based Authentication: Secure login system with role separation between Support Engineers and Admin users.

Tech Stack
Frontend
React.js (Vite)
Tailwind CSS (dark-themed NOC UI)
Recharts (data visualization)
React Router (navigation)
Backend
Node.js & Express.js
MongoDB (Mongoose)
JSON Web Tokens (JWT) (authentication)
node-cron (network simulation, metrics updates, and failure generation)
Rule-Based Engine (for troubleshooting recommendations)
