# QuizFlow PRO - Interactive Trivia Engine with QR Code & Room PIN System

**QuizFlow PRO** is an ultra-modern, high-performance quiz and trivia web application featuring real-time Web Audio sound effects, lifelines (50:50, Timer Freeze, Hint, Skip), streak multipliers, custom quiz builder, global leaderboards, and an **instant Participant QR Code & Room Code joining system**.

---

## ⚡ New: Participant Join System (QR Code & Room Code)

Participants can now join any quiz session instantly without registration using **QR Scanning** or a **Room Code / PIN**:

### 📱 How Participants Join
1. **Enter Join Code / PIN**:
   - Click **"📱 Join Quiz"** in the top navigation or use the **Quick Join** bar on the home screen.
   - Enter the 6-character room code (e.g. `QZ-DEMO`, `WEB-101`, `TECH-202`) and enter your nickname.
   - Click **"Verify & Join ➔"** to preview the assessment and launch into the challenge!
2. **Scan QR Code (Camera Scanner)**:
   - Select the **"📷 Scan QR Code"** tab in the Join modal.
   - Point your device or smartphone camera at the host's screen or invite card.
   - The interactive HUD laser scanner will detect the code automatically, play a confirmation chime, and load the quiz immediately.
   - You can also upload a screenshot or image of any QR code via the **"📁 Upload Image"** button.
3. **Scan with Native Smartphone Camera**:
   - Point your iPhone or Android camera app at the host's QR code.
   - Tapping the scanned link directly opens the Quiz with the room code pre-loaded and validated!

---

## 📡 How Hosts Share / Present Quizzes
1. Click **"📡 Host & Share"** in the configuration bar, or click **"Host"** on any category card.
2. A high-resolution **QR Code** and large **Room Join Code** (e.g. `QZ-8492`) are generated instantly.
3. Hosts can:
   - **📋 Copy Room Code**: Quick share to chats or whiteboards.
   - **📋 Copy Join Link**: Direct link for remote participants.
   - **📥 Download Invite Card**: Exports a clean, high-resolution PNG card with the QR code, title, and room code for printing or projectors.
   - **🚀 Launch Quiz Now**: Host and play alongside participants!

---

## 🚀 Getting Started

### Local Development
```bash
# Install dependencies (or run directly with serve)
npm install

# Start local server
npm run dev
# Or
npx serve . -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla JavaScript (ES6+ Classes), Modern CSS Design Tokens
- **Sound**: Web Audio API (zero external audio file dependencies)
- **QR Engine**: Standalone vector QR code generation (`qrcode-generator`)
- **QR Scanner**: Real-time canvas pixel analysis (`jsQR` + HTML5 `getUserMedia`)
- **Persistence**: LocalStorage with automatic expiration & cross-device URL parameter compression