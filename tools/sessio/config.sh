# =============================================================================
# config.sh — Paràmetres de la sessió de treball (opcional)
# =============================================================================
#
# Aquest fitxer el llegeix `sessio.sh` just després dels valors per defecte.
# Si una variable no hi és, s'aplica el valor del guió. No cal tocar-lo perquè
# tot funcioni: és aquí per si algun dia canvien els ports o la disposició.
#
# Els valors estan comentats a posta: descomenta només el que vulguis canviar.
# =============================================================================

# Port del servidor DeepSeek Harness (la GUI de l'agent).
# DSH_PORT=3080

# Port de Vite, que és on es treballa (fa de proxy cap al 8888).
# WEB_PORT=3003

# Port de `netlify dev`, que serveix les funcions de servidor.
# PROVES_PORT=8888

# Nom que s'obre al navegador per a la web (localhost o 127.0.0.1).
# WEB_HOST="localhost"

# Segons que s'espera la URL autenticada del DSH en arrencar-lo.
# ESPERA_DSH=90

# Segons que s'espera que el port de Vite respongui abans d'obrir el navegador.
# ESPERA_WEB=150
