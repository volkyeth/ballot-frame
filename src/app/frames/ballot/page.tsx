import { Metadata } from "next";
import App from "~/app/app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/frames/ballot/opengraph-image`,
  button: {
    title: "Launch Ballot Frame",
    action: {
      type: "launch_frame",
      name: "Ballot Frame",
      url: `${appUrl}/frames/ballot/`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const metadata: Metadata = {
  title: "Ballot Frame",
  description: "Create and vote on ballots with Farcaster Frames v2",
  openGraph: {
    title: "Ballot Frame",
    description: "Create and vote on ballots with Farcaster Frames v2",
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export default function BallotFrame() {
  return <App title={"Ballot Frame"} />;
} 