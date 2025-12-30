import { ConnectOptions, useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";

export default function StartCall({ accessToken }: { accessToken: string }) {
  const { status, connect } = useVoice();

  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID || "77fd4e3d-4efa-4c8d-a36b-5383407b625a";

  const EVI_CONNECT_OPTIONS: ConnectOptions = {
    auth: { type: "accessToken", value: accessToken },
    configId
  };

  return (
    <AnimatePresence>
      {status.value !== "connected" ? (
        <motion.div
          className={
            "fixed inset-0 p-4 flex items-center justify-center bg-background"
          }
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >
          <AnimatePresence>
            <motion.div
              variants={{
                initial: { scale: 0.5 },
                enter: { scale: 1 },
                exit: { scale: 0.5 },
              }}
            >
              <Button
                className={"z-50 flex items-center gap-1.5"}
                onClick={() => {
                  console.log("Connecting with config:", EVI_CONNECT_OPTIONS.configId);
                  console.log("Access token present:", !!accessToken);
                  connect(EVI_CONNECT_OPTIONS)
                    .then(() => {
                      console.log("Connected successfully!");
                    })
                    .catch((err) => {
                      console.error("Connection failed:", err);
                    });
                }}
              >
                <span>
                  <Phone
                    className={"size-4 opacity-50"}
                    strokeWidth={2}
                    stroke={"currentColor"}
                  />
                </span>
                <span>Start Call</span>
              </Button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
