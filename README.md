# Matikkapeli 🎒 (Finnish Elementary Math Practice)

A child-friendly, responsive, 100% client-side web application designed for Finnish elementary school students (grades 1–2 / 1.–2. luokkalaiset) to practice arithmetic operations.

Built with **React**, **Vite**, and **Tailwind CSS**. Designed mobile and tablet-first with clean scaling for desktop, ready for zero-cost deployment on **Azure Static Web Apps**.

---

## ✨ Features

### 1. Configuration & Setup Screen
- **Math Operations**:
  - Yhteenlasku (`+` Addition)
  - Vähennyslasku (`−` Subtraction)
  - Kertolasku (`×` Multiplication)
  - Jakolasku (`÷` Division)
  - Multi-select support to practice individual or mixed operations.
- **Finnish Primary School (Grades 1–2) Number Ranges**:
  - Presets: `0–10` (1st grade autumn), `0–20` (1st grade spring), `0–50`, `0–100` (2nd grade), or custom limits.
  - Subtraction is guaranteed non-negative ($A \ge B \ge 0$).
  - Division questions feature clean integer quotients with zero remainder.
- **Granular Multiplication Limits**:
  - Select table ranges (e.g., from table 2 to 6, generating $2 \times 1$ up to $6 \times 10$).
  - Or toggle individual tables (e.g. 2, 5, 10).
- **Test Length**:
  - Quick choices: 5, 10, 20, 50 questions.
- **Feedback Modes**:
  - **Immediate (Välitön palaute)**: Instant visual feedback, encouraging sound effects, and answer checking after each question.
  - **End of Test (Kokeen lopussa)**: Examination mode where scores and full mistake reviews are revealed only upon completion.
- **Pedagogical Assistance Option** (in Immediate mode):
  - Toggle to reveal the correct answer after $X$ failed attempts (configurable to 1, 2, or 3 attempts, default 2).

### 2. Test Interface & Input
- **Child-Friendly Display**:
  - Large, high-contrast numbers with smooth animations (`Fredoka` & `Nunito` fonts).
  - Live progress bar, question counter, stopwatch timer, and active star tracker.
- **Dual Input System**:
  - **Custom On-Screen Keypad**: Tactile numeric buttons (0–9, Finnish decimal comma `,`, Backspace `⌫`, and Clear `Pyyhi`), preventing erratic OS keyboard popping on iPads and mobile touchscreens.
  - **Native Keyboard & Physical Keyboard Support**: Native `inputmode="decimal"` and `pattern="[0-9,]*"` plus event listeners for physical desktop keyboards (0–9, Numpad, comma, period, Enter, Backspace).

### 3. Audio & Celebration
- Built-in Web Audio API sound synthesizer with zero external sound files:
  - Cheerful keypad taps
  - Harmonious ascending chime on correct answers
  - Gentle, non-punishing double-tone for errors
  - Fanfare chime and celebratory confetti (`canvas-confetti`) on test completion.
- Sound can be toggled on/off at any time.

### 4. Reporting & Local Storage
- All session records are stored client-side in browser `localStorage`.
- Comprehensive **Reports / History View**:
  - Aggregate statistics (total tests completed, total questions solved, average percentage, total practice time).
  - Individual session cards showing date/time, operations practiced, score, percentage, duration, and feedback mode.
  - Expandable detailed review for past sessions to see individual questions, child's answers, and corrections.
  - Options to delete individual records or clear all history.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or v22 LTS recommended)
- npm (v10+ bundled with Node)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
The production bundle will be generated in `dist/`.

---

## ☁️ GitHub Actions CI/CD to Azure (User-Assigned Managed Identity + OIDC)

The workflow file is located at [`.github/workflows/azure-static-web-apps.yml`](.github/workflows/azure-static-web-apps.yml).

Instead of creating an Entra App Registration or managing long-lived secrets, it uses an **Azure User-Assigned Managed Identity (UAMI)** with **OpenID Connect (OIDC)** federated credentials. This means:
- No Entra ID / Azure AD application administrator permissions required.
- Managed directly as a regular Azure resource inside your resource group.
- Zero credentials or secrets stored in GitHub.

### Setup Guide in 3 Steps

#### 1. Create User-Assigned Managed Identity & Federated Credential in Azure
Run the following in Azure CLI (or Azure Cloud Shell):

```bash
# Variables
IDENTITY_NAME="uami-math-exercise"
REPO_OWNER="<YOUR-GITHUB-USERNAME-OR-ORG>"
REPO_NAME="<YOUR-GITHUB-REPO-NAME>"
RG="<YOUR-RESOURCE-GROUP>"
SWA_NAME="<YOUR-STATIC-WEB-APP-NAME>"

# 1. Create the User-Assigned Managed Identity in your resource group
az identity create --name "$IDENTITY_NAME" --resource-group "$RG"

# 2. Get the Managed Identity's Client ID
UAMI_CLIENT_ID=$(az identity show --name "$IDENTITY_NAME" --resource-group "$RG" --query clientId -o tsv)

# 3. Add Federated OIDC Credential for main branch
az identity federated-credential create --name "github-main" --identity-name "$IDENTITY_NAME" --resource-group "$RG" --issuer "https://token.actions.githubusercontent.com" --subject "repo:$REPO_OWNER/$REPO_NAME:ref:refs/heads/main" --audiences "api://AzureADTokenExchange"

# 4. (Optional) Add Federated OIDC Credential for PR preview environments
az identity federated-credential create --name "github-prs" --identity-name "$IDENTITY_NAME" --resource-group "$RG" --issuer "https://token.actions.githubusercontent.com" --subject "repo:$REPO_OWNER/$REPO_NAME:pull_request" --audiences "api://AzureADTokenExchange"

# 5. Grant Contributor access on the Static Web App to the Managed Identity
SWA_ID=$(az staticwebapp show --name "$SWA_NAME" --resource-group "$RG" --query id -o tsv)
az role assignment create --assignee "$UAMI_CLIENT_ID" --role "Contributor" --scope "$SWA_ID"
```

#### 2. Configure GitHub Repository Variables
In your GitHub repository, go to **Settings > Secrets and variables > Actions > Variables** (these are non-sensitive variables, **no secrets needed**):

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `AZURE_CLIENT_ID` | `$UAMI_CLIENT_ID` | Client ID of the User-Assigned Managed Identity |
| `AZURE_TENANT_ID` | `$(az account show --query tenantId -o tsv)` | Azure Tenant ID |
| `AZURE_SUBSCRIPTION_ID` | `$(az account show --query id -o tsv)` | Azure Subscription ID |
| `AZURE_RESOURCE_GROUP` | Name of your Resource Group | e.g. `rg-math-exercise` |
| `AZURE_SWA_NAME` | Name of your Static Web App | e.g. `matikkapeli-app` |

#### 3. Trigger Deployment
Push any commit to `main` (or create a pull request). The pipeline will:
1. Checkout and build the client application (`npm run build`).
2. Request an ephemeral OIDC token from GitHub.
3. Authenticate to Azure via the User-Assigned Managed Identity (`azure/login@v3`).
4. Fetch a temporary deployment token and deploy to Azure Static Web Apps.
