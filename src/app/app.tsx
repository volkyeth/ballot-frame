"use client";

import sdk, { type Context } from "@farcaster/frame-sdk";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const BallotApp = dynamic(() => import("~/components/BallotApp"), {
  ssr: false,
});

export default function App(
  { title }: { title?: string } = { title: "Ballot Frame" }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context);
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return <BallotApp title={title} context={context} />;
}
