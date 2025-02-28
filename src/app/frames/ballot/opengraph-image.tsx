import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Ballot Frame";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative bg-white">
        <div tw="flex flex-col items-center justify-center">
          <h1 tw="text-6xl font-bold mb-4">Ballot Frame</h1>
          <p tw="text-2xl text-gray-600">Create and vote on ballots</p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 