import dynamicImport from "next/dynamic";

// Force dynamic rendering to get fresh access token on each request
export const dynamic = "force-dynamic";
export const revalidate = 0;

const Chat = dynamicImport(() => import("@/components/Chat"), {
  ssr: false,
});

async function getAccessToken(): Promise<string> {
  const apiKey = process.env.HUME_API_KEY;
  const secretKey = process.env.HUME_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("HUME_API_KEY or HUME_SECRET_KEY not set");
  }

  // Manual token fetch to debug issues
  const authString = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const res = await fetch("https://api.hume.ai/oauth2-cc/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${authString}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Hume token error:", res.status, text);
    throw new Error(`Failed to get Hume token: ${res.status}`);
  }

  const data = await res.json();
  console.log("Hume token response keys:", Object.keys(data));

  if (!data.access_token) {
    console.error("No access_token in response:", data);
    throw new Error("No access_token in Hume response");
  }

  return data.access_token;
}

export default async function Page() {
  const accessToken = await getAccessToken();
  console.log("Server: Access token length:", accessToken.length);

  return (
    <div className={"grow flex flex-col"}>
      <Chat accessToken={accessToken} />
    </div>
  );
}
