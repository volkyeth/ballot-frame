import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { Redis } from "@upstash/redis";
import { Ballot, BallotOption, generateId } from "./ballot";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function getUserNotificationDetailsKey(fid: number): string {
  return `frames-v2-demo:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<FrameNotificationDetails | null> {
  return await redis.get<FrameNotificationDetails>(
    getUserNotificationDetailsKey(fid)
  );
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  await redis.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  await redis.del(getUserNotificationDetailsKey(fid));
}

// Ballot related functions

function getBallotKey(ballotId: string): string {
  return `ballot-frame:ballot:${ballotId}`;
}

function getAllBallotsKey(): string {
  return `ballot-frame:all-ballots`;
}

export async function createBallot(ballot: Ballot): Promise<string> {
  const ballotId = ballot.id || generateId();
  ballot.id = ballotId;

  await redis.set(getBallotKey(ballotId), ballot);
  await redis.sadd(getAllBallotsKey(), ballotId);

  return ballotId;
}

export async function getBallot(ballotId: string): Promise<Ballot | null> {
  return await redis.get<Ballot>(getBallotKey(ballotId));
}

export async function updateBallot(ballot: Ballot): Promise<void> {
  await redis.set(getBallotKey(ballot.id), ballot);
}

export async function getAllBallotIds(): Promise<string[]> {
  return await redis.smembers(getAllBallotsKey());
}

export async function getAllBallots(): Promise<Ballot[]> {
  const ballotIds = await getAllBallotIds();
  if (!ballotIds.length) return [];

  const ballots: Ballot[] = [];
  for (const id of ballotIds) {
    const ballot = await getBallot(id);
    if (ballot) ballots.push(ballot);
  }

  return ballots;
}

export async function addOptionToBallot(
  ballotId: string,
  optionText: string
): Promise<boolean> {
  const ballot = await getBallot(ballotId);
  if (!ballot) return false;

  // Check if ballot is closed
  if (ballot.closed || Date.now() > ballot.expiresAt) {
    ballot.closed = true;
    await updateBallot(ballot);
    return false;
  }

  // Check if option already exists
  if (ballot.options.some(opt => opt.text.toLowerCase() === optionText.toLowerCase())) {
    return false;
  }

  const newOption: BallotOption = {
    id: generateId(),
    text: optionText,
    votes: 0,
    voters: []
  };

  ballot.options.push(newOption);
  await updateBallot(ballot);
  return true;
}

export async function voteForOption(
  ballotId: string,
  optionId: string,
  voterFid: number
): Promise<boolean> {
  const ballot = await getBallot(ballotId);
  if (!ballot) return false;

  // Check if ballot is closed
  if (ballot.closed || Date.now() > ballot.expiresAt) {
    ballot.closed = true;
    await updateBallot(ballot);
    return false;
  }

  const option = ballot.options.find(opt => opt.id === optionId);
  if (!option) return false;

  // Check if user already voted for this option
  if (option.voters.includes(voterFid)) {
    return false;
  }

  option.voters.push(voterFid);
  option.votes += 1;

  await updateBallot(ballot);
  return true;
}
