function handlePreFlightRequest(): Response {
  return new Response("Preflight OK!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}

async function handler(_req: Request): Promise<Response> {
  if (_req.method == "OPTIONS") {
    return handlePreFlightRequest();  // Add return here!
  }

  // Extract the word from the URL query parameters
  const url = new URL(_req.url);
  const userWord = url.searchParams.get("word");

  if (!userWord) {
    return new Response(JSON.stringify({ error: "Missing word parameter" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  // Choose your secret word here!
  const SECRET_WORD = "extincteur";

  const similarityRequestBody = JSON.stringify({
    word1: userWord,        // User's guess
    word2: SECRET_WORD,     // Your secret word
  });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: similarityRequestBody,
    redirect: "follow",
  };

  try {
    const response = await fetch("https://word2vec.nicolasfley.fr/similarity", requestOptions);

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return new Response(JSON.stringify({ error: response.statusText }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type",
        },
      });
    }

    const result = await response.json();

    console.log(result);
    
    // Convert the similarity result (0-1) to percentage (0-100)
    const percentageResult = {
      value: result.result * 100
    };

    return new Response(JSON.stringify(percentageResult), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

Deno.serve(handler);