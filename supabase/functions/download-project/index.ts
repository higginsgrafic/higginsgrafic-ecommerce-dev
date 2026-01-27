import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Nota: Aquest és un placeholder. En producció, necessitaràs configurar
    // l'accés al sistema de fitxers del projecte o emmagatzemar una còpia
    // pre-generada del projecte en algun lloc accessible.
    
    const errorMessage = {
      error: "Funció no disponible",
      message: "Aquesta funcionalitat requereix configuració addicional del servidor. "
        + "Per descarregar el projecte, utilitza l'opció de descàrrega directa del repositori "
        + "o contacta amb l'administrador.",
      alternatives: [
        "Descarrega des del repositori Git",
        "Exporta el projecte des de l'editor",
        "Sol·licita un enllaç de descàrrega a l'administrador"
      ]
    };

    return new Response(
      JSON.stringify(errorMessage),
      {
        status: 501,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        error: "Error intern del servidor",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});