# Startup Scripts Configuration

## Overview

This document describes the startup scripts configured for the Medical Appointments Calendar application.

## Scripts Added

### 1. `start:server`
Starts the JSON Server on port 3000, watching the db.json file for changes.

```bash
npm run start:server
```

**Command**: `json-server --watch db.json --port 3000`

### 2. `start:dev` (Recommended)
Starts both JSON Server and Angular dev server concurrently with a single command.

```bash
npm run start:dev
```

**Command**: `concurrently "npm run start:server" "npm run start"`

This script uses the `concurrently` package to run both servers simultaneously in the same terminal window.

## Dependencies Installed

- **concurrently** (v9.2.1): Allows running multiple npm scripts concurrently

## Usage

### For Development (Recommended)

Run both servers with one command:
```bash
npm run start:dev
```

This will:
1. Start JSON Server on http://localhost:3000
2. Start Angular dev server on http://localhost:4200

### For Separate Control

If you need to control the servers separately:

**Terminal 1:**
```bash
npm run start:server
```

**Terminal 2:**
```bash
npm start
```

## Existing Scripts

The following scripts were already available:

- `npm start` - Angular dev server only
- `npm run json-server` - JSON Server only (alias for start:server)
- `npm test` - Run tests
- `npm run build` - Build for production

## Requirements Validated

✅ **Requirement 8.1**: System connects to JSON Server on configured port
- JSON Server starts on port 3000
- Angular app configured to connect to http://localhost:3000

## Documentation

The README.md file has been updated with:
- Clear instructions for running the application
- Description of all available scripts
- Recommended workflow for development
- Alternative manual startup options
