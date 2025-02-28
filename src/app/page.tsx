import { Metadata } from "next";
import { redirect } from "next/navigation";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
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

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Ballot Frame",
    openGraph: {
      title: "Ballot Frame",
      description: "Create and vote on ballots with Farcaster Frames v2",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  redirect("/frames/ballot");
}
