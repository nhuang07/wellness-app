const tintColor = '#2f95dc'; // for buttons / checkbox

export default {
  light: {
    text: '#000',              // all text
    background: '#fff',        // drawer / screen background
    tint: tintColor,           // buttons / checkbox fill
    tabIconDefault: '#ccc',
    tabIconSelected: tintColor,

    // PetTodoScreen / MenuDrawer
    primaryButton: tintColor,  // Add / Group / Join / Profile button background
    inputBorder: '#ccc',       // text input border
    textDone: '#000',          // done task text
    mascotBackground: '#fff',  // mascot background
    closeButtonBackground: '#333', // close menu button background
  },
  dark: {
    text: '#000',
    background: '#fff',
    tint: tintColor,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColor,

    primaryButton: tintColor,
    inputBorder: '#ccc',
    textDone: '#000',
    mascotBackground: '#fff',
    closeButtonBackground: '#333',
  },
};
