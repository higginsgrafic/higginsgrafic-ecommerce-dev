export const siteStyles = {
  // HERO SECTION
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

  // PRODUCT CARD
  productCard: {
    title: {
      fontFamily: "Oswald",
      fontWeight: 400,
      fontSize: {
        mobile: "13pt",
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

  // PRODUCT GRID
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

  // HEADER
  header: {
    navigation: {
      fontFamily: "Roboto",
      fontWeight: 400,
      fontSize: {
        desktop: "12pt"
      }
    }
  },

  // FOOTER
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

  // CART SIDEBAR
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

  // CART PAGE
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

  // CHECKOUT
  checkout: {
    title: {
      fontFamily: "Oswald",
      fontWeight: 700,
      fontSize: {
        base: "24px"
      }
    }
  },

  // 404 PAGE
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

  // ERROR BOUNDARY
  errorBoundary: {
    title: {
      fontFamily: "Oswald",
      fontWeight: 700,
      fontSize: {
        base: "24px"
      }
    }
  },

  // LOADING SCREEN
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

// Save to localStorage
export const saveStyles = (newStyles) => {
  localStorage.setItem('siteStyles', JSON.stringify(newStyles));
};

// Load from localStorage
export const loadStyles = () => {
  const saved = localStorage.getItem('siteStyles');
  return saved ? JSON.parse(saved) : siteStyles;
};

export default siteStyles;
