export const systemMessages = {
  common: {
    loading: 'Carregant...',
    saving: 'Desant...',
    saved: 'Desat!',
    error: 'Error',
    success: 'Èxit',
    processing: 'Processant...',
  },

  toast: {
    saved: {
      title: 'Desat!',
      description: 'Els canvis s\'han desat correctament',
    },
    error: {
      title: 'Error',
      description: 'No s\'ha pogut completar l\'operació',
    },
    deleted: {
      title: 'Eliminat',
      description: 'L\'element s\'ha eliminat correctament',
    },
    copied: {
      title: 'Copiat',
      description: 'S\'ha copiat al portapapers',
    },
    uploaded: {
      title: 'Pujat',
      description: 'El fitxer s\'ha pujat correctament',
    },
  },

  editor: {
    saved: 'Tots els textos s\'han desat correctament a localStorage',
    saveError: 'No s\'ha pogut desar els textos',
    reset: 'Tots els textos s\'han restaurat als valors originals',
  },

  promotions: {
    imported: 'Importat correctament',
    saved: 'Desat',
    activated: 'Activat',
    deactivated: 'Desactivat',
    importError: 'Fitxer no vàlid',
    saveError: 'No s\'ha pogut desar',
    loadError: 'No s\'ha pogut carregar la configuració',
  },

  media: {
    uploaded: 'Fitxer pujat',
    uploadedDescription: '{fileName} s\'ha pujat correctament',
    uploadError: 'No s\'ha pogut pujar {fileName}: {error}',
    deleted: 'Fitxer esborrat',
    deletedDescription: '{fileName} s\'ha esborrat correctament',
    deleteError: 'No s\'ha pogut esborrar el fitxer',
    loadError: 'No s\'han pogut carregar els fitxers',
    formatInvalid: 'Format no vàlid',
    formatInvalidDescription: 'Si us plau, seleccioneu fitxers d\'imatge, vídeo, àudio o PDF',
    someIgnored: 'Alguns fitxers s\'han ignorat',
    someIgnoredDescription: '{count} fitxer(s) no tenen un format vàlid',
    urlCopied: 'URL copiada',
    urlCopiedDescription: 'L\'enllaç s\'ha copiat al portapapers',
    urlCopyError: 'No s\'ha pogut copiar l\'URL',
    folderCreated: 'Carpeta creada',
    folderCreatedDescription: 'Ara pots pujar fitxers a "{folderName}"',
  },

  products: {
    loadError: 'No s\'han pogut carregar els productes',
    addedToCart: 'Afegit al cistell',
    addedToCartDescription: '{productName} s\'ha afegit al cistell',
    removedFromCart: 'Eliminat del cistell',
    outOfStock: 'No disponible',
    selectSize: 'Seleccioneu una talla',
  },

  cart: {
    empty: 'El cistell està buit',
    updated: 'Cistell actualitzat',
    itemRemoved: 'Producte eliminat del cistell',
    quantityUpdated: 'Quantitat actualitzada',
  },

  checkout: {
    processing: 'Processant la comanda...',
    success: 'Comanda realitzada amb èxit',
    error: 'Hi ha hagut un problema a l\'hora de processar la comanda. Si us plau, torneu-ho a provar.',
    invalidEmail: 'Correu electrònic no vàlid',
    invalidCard: 'Targeta no vàlida',
    fieldRequired: 'Aquest camp és obligatori',
  },

  auth: {
    loginSuccess: 'Sessió iniciada',
    loginError: 'Error en iniciar sessió',
    logoutSuccess: 'Sessió tancada',
    registerSuccess: 'Compte creat correctament',
    registerError: 'Error en crear el compte',
    invalidCredentials: 'Credencials incorrectes',
    emailRequired: 'El correu electrònic és obligatori',
    passwordRequired: 'La contrasenya és obligatòria',
  },

  validation: {
    required: 'Aquest camp és obligatori',
    invalidEmail: 'Correu electrònic no vàlid',
    minLength: 'Mínim {min} caràcters',
    maxLength: 'Màxim {max} caràcters',
    passwordMismatch: 'Les contrasenyes no coincideixen',
    invalidFormat: 'Format no vàlid',
  },

  network: {
    offline: 'No hi ha connexió a Internet',
    online: 'Connexió restablerta',
    timeout: 'La connexió ha tardat massa',
    serverError: 'Error del servidor',
  },

  confirmation: {
    deleteTitle: 'Confirmar eliminació',
    deleteMessage: 'Segur que voleu eliminar aquest element?',
    unsavedChanges: 'Hi ha canvis sense desar',
    unsavedChangesMessage: 'Si sortiu ara, es perdran els canvis no desats.',
    confirm: 'Confirmar',
    cancel: 'Cancel·lar',
  },
};

export default systemMessages;
