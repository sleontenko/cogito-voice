import dynamicImport from "next/dynamic";
import { fetchAccessToken } from "hume";

// Force dynamic rendering to get fresh access token on each request
export const dynamic = "force-dynamic";
export const revalidate = 0;

const Chat = dynamicImport(() => import("@/components/Chat"), {
  ssr: false,
});

export default async function Page() {
  if (!process.env.HUME_API_KEY) {
    throw new Error("HUME_API_KEY environment variable is not set");
  }
  if (!process.env.HUME_SECRET_KEY) {
    throw new Error("HUME_SECRET_KEY environment variable is not set");
  }

  const accessToken = await fetchAccessToken({
    apiKey: String(process.env.HUME_API_KEY),
    secretKey: String(process.env.HUME_SECRET_KEY),
  });

  console.log("Server: Access token length:", accessToken.length, "prefix:", accessToken.substring(0, 8));

  return (
    <div className={"grow flex flex-col"}>
      <Chat accessToken={accessToken} />
    </div>
  );
}
