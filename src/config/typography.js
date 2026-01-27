export const typography = {
  hero: {
    title: {
      fontFamily: "Oswald",
      fontWeight: 800,
      fontSize: {
        mobile: "22pt",
        tablet: "25pt",
        desktop: "60px"
      }
    },
    subtitle: {
      fontFamily: "Roboto",
      fontWeight: 200,
      fontSize: {
        mobile: "24px",
        tablet: "27px",
        desktop: "30px"
      }
    }
  },
  productCard: {
    title: {
      fontFamily: "Oswald",
      fontWeight: 400,
      fontSize: {
        mobile: "12pt",
        tablet: "14pt",
        desktop: "16pt"
      }
    },
    description: {
      fontFamily: "Roboto Condensed",
      fontWeight: 300,
      fontSize: {
        desktop: "14pt"
      }
    },
    price: {
      fontFamily: "Oswald",
      fontWeight: 400,
      fontSize: {
        mobile: "13pt",
        tablet: "14pt",
        desktop: "16pt"
      }
    },
    sizeButtons: {
      fontFamily: "Oswald",
      fontWeight: 400,
      fontSize: {
        mobile: "11pt",
        tablet: "12pt",
        desktop: "14pt"
      }
    }
  },
  productGrid: {
    title: {
      fontFamily: "Oswald",
      fontWeight: 600,
      fontSize: {
        mobile: "16pt",
        tablet: "18pt",
        desktop: "20pt"
      }
    },
    description: {
      fontFamily: "Roboto",
      fontWeight: 300,
      fontSize: {
        mobile: "11pt",
        tablet: "12pt",
        desktop: "14pt"
      }
    }
  },
  header: {
    navigation: {
      fontFamily: "Roboto",
      fontWeight: 400,
      fontSize: {
        desktop: "12pt"
      }
    }
  },
  footer: {
    collections: {
      fontFamily: "Oswald",
      fontWeight: 400,
      fontSize: {
        desktop: "18.4pt"
      }
    },
    serviceTitle: {
      fontFamily: "Oswald",
      fontWeight: 400,
      fontSize: {
        mobile: "13pt",
        tablet: "14pt"
      }
    },
    serviceLinks: {
      fontFamily: "Roboto",
      fontWeight: 300,
      fontSize: {
        mobile: "11pt",
        tablet: "12pt"
      }
    },
    copyright: {
      fontFamily: "Roboto",
      fontWeight: 400,
      fontSize: {
        mobile: "12pt",
        tablet: "14pt"
      }
    }
  },
  cart: {
    title: {
      fontFamily: "Oswald",
      fontWeight: 700,
      fontSize: {
        mobile: "20px",
        tablet: "24px"
      }
    },
    itemName: {
      fontFamily: "Oswald",
      fontWeight: 700,
      fontSize: {
        base: "16px"
      }
    },
    price: {
      fontFamily: "Oswald",
      fontWeight: 400,
      fontSize: {
        base: "20px"
      }
    },
    total: {
      fontFamily: "Oswald",
      fontWeight: 400,
      fontSize: {
        mobile: "20px",
        tablet: "24px"
      }
    }
  },
  cartPage: {
    title: {
      fontFamily: "Oswald",
      fontWeight: 700,
      fontSize: {
        mobile: "20px",
        tablet: "24px",
        desktop: "30px"
      }
    },
    subtitle: {
      fontFamily: "Roboto",
      fontWeight: 400,
      fontSize: {
        mobile: "12px",
        tablet: "14px"
      }
    }
  },
  checkout: {
    title: {
      fontFamily: "Oswald",
      fontWeight: 700,
      fontSize: {
        base: "24px"
      }
    }
  },
  notFound: {
    number: {
      fontFamily: "Oswald",
      fontWeight: 700,
      fontSize: {
        base: "144px"
      }
    },
    title: {
      fontFamily: "Oswald",
      fontWeight: 700,
      fontSize: {
        mobile: "24px",
        tablet: "30px"
      }
    }
  },
  errorBoundary: {
    title: {
      fontFamily: "Oswald",
      fontWeight: 700,
      fontSize: {
        base: "24px"
      }
    }
  },
  loading: {
    text: {
      fontFamily: "Roboto",
      fontWeight: 400,
      fontSize: {
        base: "14px"
      }
    }
  }
};

/**
 * Helper function to generate responsive font size classes
 */
export const getTypographyClasses = (config) => {
  const classes = [];

  // Font family - using CSS variable format for Tailwind
  if (config.fontFamily) {
    if (config.fontFamily === 'Oswald') {
      classes.push('font-oswald');
    } else if (config.fontFamily === 'Roboto') {
      classes.push('font-roboto');
    } else if (config.fontFamily === 'Roboto Condensed') {
      classes.push('font-roboto-condensed');
    }
  }

  // Font weight - using Tailwind standard classes
  if (config.fontWeight) {
    const weightMap = {
      100: 'font-thin',
      200: 'font-extralight',
      300: 'font-light',
      400: 'font-normal',
      500: 'font-medium',
      600: 'font-semibold',
      700: 'font-bold',
      800: 'font-extrabold',
      900: 'font-black'
    };
    classes.push(weightMap[config.fontWeight] || 'font-normal');
  }

  return classes.join(' ');
};

/**
 * Helper function to get inline styles for font sizes (more reliable than dynamic Tailwind classes)
 */
export const getTypographyStyles = (config) => {
  const styles = {};

  if (config.fontSize) {
    // Base/mobile font size
    if (config.fontSize.mobile) {
      styles.fontSize = config.fontSize.mobile;
    } else if (config.fontSize.base) {
      styles.fontSize = config.fontSize.base;
    }
  }

  return styles;
};

/**
 * Helper to get responsive styles using CSS custom properties
 */
export const getResponsiveTypographyStyles = (config) => {
  const styles = {};

  if (config.fontSize) {
    const mobile = config.fontSize.mobile || config.fontSize.base;
    const tablet = config.fontSize.tablet || mobile;
    const desktop = config.fontSize.desktop || tablet;

    // Use mobile as base
    styles.fontSize = mobile;

    return {
      ...styles,
      '@media (min-width: 768px)': {
        fontSize: tablet
      },
      '@media (min-width: 1024px)': {
        fontSize: desktop
      }
    };
  }

  return styles;
};

export default typography;
