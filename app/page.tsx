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
    throw new Error("The HUME_API_KEY environment variable is not set.");
  }
  if (!process.env.HUME_SECRET_KEY) {
    throw new Error("The HUME_SECRET_KEY environment variable is not set.");
  }
  const accessToken = await fetchAccessToken({
    apiKey: String(process.env.HUME_API_KEY),
    secretKey: String(process.env.HUME_SECRET_KEY),
  });

  console.log("Server: Access token generated, length:", accessToken.length);

  return (
    <div className={"grow flex flex-col"}>
      <Chat accessToken={accessToken} />
    </div>
  );
}
