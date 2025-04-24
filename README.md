# HealthScore

HealthScore is a comprehensive mobile application built with React Native and Expo that helps users track their health symptoms and receive AI-powered health insights. The app features an intelligent chatbot for symptom discussion, daily health questionnaires, and detailed health tracking capabilities.

![HealthScore App](screenshots/app-preview.png) *(Add your screenshots here)*

## Features

### 🤖 AI-Powered Health Assistant
- Intelligent chatbot using OpenAI's API
- Natural language processing for symptom analysis
- Smart follow-up questions based on user responses
- Personalized health recommendations

### 📊 Health Tracking
- Daily morning health questionnaires
- Customizable symptom tracking
- Visual analytics and trends
- Calendar view for health history

### 📱 User Experience
- Clean and intuitive interface
- Real-time health status updates
- Parallax scrolling effects
- Dark mode support
- Cross-platform compatibility

### 🔔 Smart Features
- 24-hour interval between surveys
- Automatic symptom correlation
- Progress tracking and insights
- Health history visualization

## Tech Stack

- **Frontend**: React Native, Expo
- **State Management**: React Hooks, AsyncStorage
- **UI Components**: Custom themed components, React Native Reanimated
- **AI Integration**: OpenAI API
- **Data Visualization**: React Native Chart Kit
- **Navigation**: Expo Router
- **Development**: TypeScript, ESLint, Jest

## Screenshots

*(Add your screenshots here)*

<details>
<summary>View Screenshots</summary>

- Home Screen
- Chat Interface
- Health Survey
- Analytics Dashboard
- Calendar View

</details>

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rayansikkandar/Healthcare-AI-Health-bot.git
cd Healthcare-AI-Health-bot
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Then fill in your API keys and configuration values.

4. Start the development server:
```bash
npm start
# or
yarn start
```

### Running Tests

```bash
npm test
# or
yarn test
```

## Project Structure

```
healthscore/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab-based navigation screens
│   └── components/        # Reusable components
├── assets/                # Static assets
├── components/           # Shared components
├── constants/            # App constants and configuration
├── services/             # API and external services
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Guidelines

- Follow the TypeScript coding standards
- Write unit tests for new features
- Update documentation as needed
- Follow the commit message convention

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native framework
- [OpenAI](https://openai.com/) for the AI capabilities
- [React Native Community](https://reactnative.dev/community/overview) for the excellent components

## Contact

Rayan Sikkandar

Project Link: [https://github.com/rayansikkandar/Healthcare-AI-Health-bot](https://github.com/rayansikkandar/Healthcare-AI-Health-bot)

---

⭐️ Star this repo if you find it helpful!
