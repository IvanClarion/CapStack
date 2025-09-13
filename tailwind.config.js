/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        secondaryCard: '#231F20',
        GeneralButton: '#FF6060',
        Biege: '#F3F4F6',
        RosePink: '#FF6060',
        AscentViolet:'#4B3381',
        AscentBlue:'#667EEA',
        BorderGray:'#E0E0E0',
        AscentClicked:'#58312B',
        SecondaryBlie:'#201B61',
      },
      fontFamily: {
        inter: ['Inter'],
      }
    },
  },
  plugins: [],
  native: {
    components: {
      "expo-blur": ["BlurView"],
      "react-native": ["Image"],
    },
  },
}
