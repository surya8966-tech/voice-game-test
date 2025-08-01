# 🎙️ Surr - A Voice-Controlled Micro Game

A lightweight, single-page React web game that uses the Web Speech API to detect voice commands and control a character through voice input.

## Features

- **Voice Recognition**: Uses native Web Speech API (no external APIs required)
- **Real-time Commands**: Responds to "Jump", "Go", "Left", "Right" voice commands
- **Visual Feedback**: Shows recognized text and listening status in real-time
- **Progress Tracking**: Displays command counter and character movement
- **Responsive Design**: Built with TailwindCSS for mobile-friendly experience
- **Sound Effects**: Simple audio feedback for commands
- **Background Music**: Optional toggle for ambient music
- **Win Condition**: Complete the game after 10 successful voice commands

## How to Play

1. Click "Start Game" on the landing screen
2. Allow microphone permission when prompted
3. Say voice commands to control your rocket character:
   - **"Jump"** or **"Go"**: Move forward
   - **"Left"**: Move slightly backward
   - **"Right"**: Move slightly forward
4. Reach the finish line after 10 commands to win!

## Tech Stack

- **React 18** with functional components and hooks
- **TailwindCSS** for styling and responsive design
- **Web Speech API** for voice recognition (browser native)
- **Web Audio API** for sound effects and music

## Browser Compatibility

This game works best in:
- Chrome (recommended)
- Microsoft Edge
- Safari
- Other Chromium-based browsers

**Note**: Firefox has limited Web Speech API support.

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
```

## Privacy & Security

- **No data collection**: All voice processing happens locally in your browser
- **No external APIs**: Uses only native browser Web Speech API
- **No server communication**: Completely client-side application
- **Microphone access**: Only used for voice recognition, not recorded or stored

## Troubleshooting

**Microphone Permission Denied:**
- Check browser settings to allow microphone access
- Reload the page and try again

**Voice Commands Not Working:**
- Ensure you're in a quiet environment
- Speak clearly and at normal volume
- Try different phrasings: "jump", "go", "left", "right"

**No Sound:**
- Check browser audio settings
- Some browsers require user interaction before playing audio

## Development

The app uses React hooks for state management:
- `useState` for game state, voice recognition status, and counters
- `useEffect` for Speech Recognition setup and cleanup
- `useRef` for managing Speech Recognition and Audio Context instances

## License

MIT License - Feel free to use and modify for your projects!

---

**Enjoy playing Surr! 🚀**
