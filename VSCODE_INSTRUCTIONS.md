# Community Battery Reserve Priority SOA - VS Code Quickstart Guide

This complete project package is ready to open and run directly in **Visual Studio Code**.

---

## ⚡ Option 1: One-Click Instant Run (Zero Setup Needed)

Because the project includes the pre-built application in `web/dist`, you can run it immediately without running `npm install`:

1. Double-click **`start.bat`** in this folder.
2. It launches the local server at **http://localhost:3000** and opens your default browser automatically.

---

## 💻 Option 2: Run Inside VS Code

### Step 1: Open Folder in VS Code
- Open **VS Code** $\to$ **File** $\to$ **Open Folder...**
- Select this unzipped project folder (`CommunityBatterySOA`).

### Step 2: Open Terminal in VS Code
- Press `Ctrl + ~` (Ctrl + Backtick) or click **Terminal $\to$ New Terminal**.

### Step 3: Run the Web App
Run either of these:

- **Instant Production Server:**
  ```powershell
  node web/server.cjs
  ```
  Then open: [http://localhost:3000](http://localhost:3000)

- **Hot-Reload Development Server (for live code editing):**
  ```powershell
  npm --prefix web run dev
  ```
  *(If you want to edit code live, this will auto-refresh whenever you edit files in `web/src/`).*

### Step 4: Run via VS Code Tasks Menu (No Typing)
- Press `Ctrl + Shift + P`
- Type `Tasks: Run Task` and press `Enter`
- Choose:
  - **`Start Web App (Production Server)`**
  - **`Start Web App (Development Mode)`**

---

## 🔑 Demo Login Accounts

| Role | Username | Password | Account Details |
| :--- | :--- | :--- | :--- |
| **Consumer (Alice)** | `member-a` | `member-a-pass` | Alice Sharma • 50 kWh Daily Cap |
| **Consumer (Bob)** | `member-b` | `member-b-pass` | Bob Patel • 50 kWh Daily Cap |
| **Chief Coordinator** | `coordinator-1` | `coord-pass` | Vikram Rao • Administrative Control |

*You can also use the **Switch User** pills in the top navbar to toggle between Alice, Bob, and Vikram in 1 click.*
