# Notification Admin Web UI

Modern administration dashboard for the ExcellenceKits Notification Service, built with Next.js 15, React 19, TypeScript, and Mantis Material-UI template.

## Features

- **Dashboard**: Live delivery metrics, channel distribution (Email, Push, SMS), system health, and real-time delivery audit feed.
- **Notification Types**: Configure application-specific notification triggers, default channels, and active toggles.
- **Templates Management**: Manage multi-channel message templates (Email HTML/Text, FCM Push, SMS) with live syntax preview and variable substitution (`{customerName}`, `{orderNumber}`, etc.).
- **Providers & Gateways**: Configure outbound relay accounts (SMTP, Firebase Cloud Messaging, SMS gateways) with sender display names and credentials.
- **Audit & Delivery Logs**: Full searchable and filterable history of dispatched notifications, recipients, channels, and delivery payloads.
- **Live Dispatch Sandbox (Test Send)**: Interactive test tool to preview and dispatch notifications directly against the backend with custom JSON payloads.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Standalone build output)
- **UI & Design**: Material-UI (MUI v6/v7 Grid v2), Mantis Dashboard template
- **State & Data**: React hooks, Axios, SWR-ready
- **Auth**: NextAuth.js / OAuth2 Authorization Code Flow with PKCE
- **Deployment**: Docker multi-stage container, Kubernetes (RKE2), Jenkins CI/CD

## Development

```bash
# Run locally (port 3007)
npm run dev
```

## Production Build

```bash
npm run build
npm run start
```

## Configuration

Environment variables can be configured via `.env` or at runtime via `public/config.js` (generated dynamically by Kubernetes ConfigMap):

- `NEXT_PUBLIC_NOTIFICATION_API_SERVER`: URL of the Notification backend service (e.g. `https://notification-stg.excellencekits.com/notification-service`).
- `NEXT_PUBLIC_APPLICATION_HOST`: Host URL of this dashboard.
- `NEXT_PUBLIC_OAUTH2_SERVER`: Authorization server URL.
