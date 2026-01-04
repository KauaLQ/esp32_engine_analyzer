import { createTheme } from '@mantine/core';

// Define the theme according to the requirements
// Base: white (main background)
// Primary: soft orange (primary actions, links, highlights)
// Danger/Crit: moderate red (errors and CRIT)
// Warn: orange (warnings)
// Neutrals: light grays (borders, secondary texts)

export const theme = createTheme({
  primaryColor: 'orange',
  colors: {
    // Custom orange palette
    orange: [
      '#FFF8F0', // 0: Lightest
      '#FFF1E0', // 1
      '#FFE8CC', // 2
      '#FFD9AD', // 3
      '#FFC88E', // 4
      '#FFB86F', // 5: Primary
      '#FF9F40', // 6
      '#FF8811', // 7
      '#E67300', // 8
      '#CC6600', // 9: Darkest
    ],
    // Custom red palette for danger/critical
    red: [
      '#FFF5F5', // 0: Lightest
      '#FFE3E3', // 1
      '#FFC9C9', // 2
      '#FFA8A8', // 3
      '#FF8787', // 4
      '#FF6B6B', // 5: Primary
      '#FA5252', // 6
      '#F03E3E', // 7
      '#E03131', // 8
      '#C92A2A', // 9: Darkest
    ],
    // Neutral grays
    gray: [
      '#F8F9FA', // 0: Lightest
      '#F1F3F5', // 1
      '#E9ECEF', // 2
      '#DEE2E6', // 3
      '#CED4DA', // 4
      '#ADB5BD', // 5
      '#868E96', // 6
      '#495057', // 7
      '#343A40', // 8
      '#212529', // 9: Darkest
    ],
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  defaultRadius: 'md',
  
  // Component defaults
  components: {
    Card: {
      defaultProps: {
        withBorder: true,
        radius: 'lg',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

export default theme;
