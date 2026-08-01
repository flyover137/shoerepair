export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }

  // Exchange code for token
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const result = await response.json();
  const token = result.access_token;
  const error = result.error || '';

  let html;
  if (token) {
    html = `
      <html>
        <body>
          <script>
            const receiveMessage = (message) => {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({ token })}',
                message.origin
              );
              window.removeEventListener("message", receiveMessage, false);
              window.close();
            };
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          </script>
        </body>
      </html>
    `;
  } else {
    html = `
      <html>
        <body>
          <script>
            const receiveMessage = (message) => {
              window.opener.postMessage(
                'authorization:github:error:${JSON.stringify({ error })}',
                message.origin
              );
              window.removeEventListener("message", receiveMessage, false);
              window.close();
            };
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          </script>
        </body>
      </html>
    `;
  }

  return new Response(html, {
    headers: { 'content-type': 'text/html' }
  });
}
