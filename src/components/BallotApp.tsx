"use client";

import { type Context } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Ballot, BallotDuration, BallotOption, calculateExpirationTimestamp, formatDate, generateId } from "~/lib/ballot";

export default function BallotApp({ title, context }: { title?: string, context?: Context.FrameContext }) {
  const [currentView, setCurrentView] = useState<"home" | "create" | "view" | "vote">("home");
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [currentBallot, setCurrentBallot] = useState<Ballot | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>([""]);
  const [duration, setDuration] = useState<BallotDuration>(BallotDuration.ONE_DAY);
  const [newOptionText, setNewOptionText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Use the user's fid from context
  const userFid = context?.user?.fid || 0;

  // Fetch all ballots on component mount
  useEffect(() => {
    fetchBallots();
  }, []);

  async function fetchBallots() {
    setLoading(true);
    try {
      const response = await fetch("/api/ballots");
      if (!response.ok) throw new Error("Failed to fetch ballots");
      
      const data = await response.json();
      setBallots(data.ballots);
    } catch (err) {
      setError("Failed to load ballots");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBallot() {
    if (!newQuestion.trim()) {
      setError("Question is required");
      return;
    }

    // Filter out empty options
    const validOptions = newOptions.filter(opt => opt.trim() !== "");
    
    setLoading(true);
    try {
      const ballot: Ballot = {
        id: generateId(),
        question: newQuestion,
        options: validOptions.map(text => ({
          id: generateId(),
          text,
          votes: 0,
          voters: []
        })),
        createdBy: userFid,
        createdAt: Date.now(),
        expiresAt: calculateExpirationTimestamp(duration),
        closed: false
      };

      const response = await fetch("/api/ballots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ballot })
      });

      if (!response.ok) throw new Error("Failed to create ballot");
      
      setSuccess("Ballot created successfully!");
      setNewQuestion("");
      setNewOptions([""]);
      setDuration(BallotDuration.ONE_DAY);
      
      // Refresh ballots and go back to home
      await fetchBallots();
      setCurrentView("home");
    } catch (err) {
      setError("Failed to create ballot");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOption() {
    if (!currentBallot) return;
    if (!newOptionText.trim()) {
      setError("Option text is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/ballots/${currentBallot.id}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newOptionText, fid: userFid })
      });

      if (!response.ok) throw new Error("Failed to add option");
      
      setSuccess("Option added successfully!");
      setNewOptionText("");
      
      // Refresh current ballot
      await fetchBallot(currentBallot.id);
    } catch (err) {
      setError("Failed to add option");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(optionId: string) {
    if (!currentBallot) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ballots/${currentBallot.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId, fid: userFid })
      });

      if (!response.ok) throw new Error("Failed to vote");
      
      setSuccess("Vote recorded successfully!");
      
      // Refresh current ballot
      await fetchBallot(currentBallot.id);
    } catch (err) {
      setError("Failed to vote");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBallot(id: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/ballots/${id}`);
      if (!response.ok) throw new Error("Failed to fetch ballot");
      
      const data = await response.json();
      setCurrentBallot(data.ballot);
    } catch (err) {
      setError("Failed to load ballot");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleViewBallot(ballot: Ballot) {
    setCurrentBallot(ballot);
    setCurrentView("view");
  }

  function addOptionField() {
    setNewOptions([...newOptions, ""]);
  }

  function updateOption(index: number, value: string) {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  }

  function removeOption(index: number) {
    if (newOptions.length <= 1) return;
    const updatedOptions = [...newOptions];
    updatedOptions.splice(index, 1);
    setNewOptions(updatedOptions);
  }

  // Clear error and success messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Render home view (list of ballots)
  function renderHome() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{title || "Ballot App"}</h1>
          <Button onClick={() => setCurrentView("create")}>Create New Ballot</Button>
        </div>
        
        {loading ? (
          <div className="text-center py-10">Loading ballots...</div>
        ) : ballots.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No ballots found</p>
            <Button className="mt-4" onClick={() => setCurrentView("create")}>Create Your First Ballot</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {ballots.map(ballot => (
              <div 
                key={ballot.id} 
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleViewBallot(ballot)}
              >
                <h2 className="font-semibold text-lg">{ballot.question}</h2>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{ballot.options.length} options</span>
                  <span>
                    {ballot.closed || Date.now() > ballot.expiresAt 
                      ? "Closed" 
                      : `Expires: ${formatDate(ballot.expiresAt)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render create ballot form
  function renderCreate() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create New Ballot</h1>
          <Button className="bg-transparent text-black border border-gray-300 hover:bg-gray-100" onClick={() => setCurrentView("home")}>Back</Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Question</Label>
            <Input 
              id="question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter your question here"
            />
          </div>
          
          <div>
            <Label>Options (optional)</Label>
            {newOptions.map((option, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input 
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button 
                  className="bg-transparent text-black border border-gray-300 hover:bg-gray-100"
                  onClick={() => removeOption(index)}
                  disabled={newOptions.length <= 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button 
              className="bg-transparent text-black border border-gray-300 hover:bg-gray-100 mt-2"
              onClick={addOptionField}
            >
              Add Option
            </Button>
          </div>
          
          <div>
            <Label>Duration</Label>
            <div className="flex gap-2 mt-2">
              <Button 
                className={duration === BallotDuration.ONE_DAY ? "" : "bg-transparent text-black border border-gray-300 hover:bg-gray-100"}
                onClick={() => setDuration(BallotDuration.ONE_DAY)}
              >
                1 Day
              </Button>
              <Button 
                className={duration === BallotDuration.TWO_DAYS ? "" : "bg-transparent text-black border border-gray-300 hover:bg-gray-100"}
                onClick={() => setDuration(BallotDuration.TWO_DAYS)}
              >
                2 Days
              </Button>
              <Button 
                className={duration === BallotDuration.THREE_DAYS ? "" : "bg-transparent text-black border border-gray-300 hover:bg-gray-100"}
                onClick={() => setDuration(BallotDuration.THREE_DAYS)}
              >
                3 Days
              </Button>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleCreateBallot}
            disabled={loading || !newQuestion.trim()}
            isLoading={loading}
          >
            Create Ballot
          </Button>
        </div>
      </div>
    );
  }

  // Render ballot view
  function renderBallotView() {
    if (!currentBallot) return null;
    
    const isExpired = Date.now() > currentBallot.expiresAt;
    const isClosed = currentBallot.closed || isExpired;
    
    // Sort options by votes (descending)
    const sortedOptions = [...currentBallot.options].sort((a, b) => b.votes - a.votes);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{currentBallot.question}</h1>
          <Button className="bg-transparent text-black border border-gray-300 hover:bg-gray-100" onClick={() => setCurrentView("home")}>Back</Button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Created by: FID {currentBallot.createdBy}</span>
            <span>
              {isClosed 
                ? "Closed" 
                : `Expires: ${formatDate(currentBallot.expiresAt)}`}
            </span>
          </div>
          
          <div className="space-y-4 mt-4">
            {sortedOptions.map((option: BallotOption) => (
              <div key={option.id} className="border rounded-lg p-3 bg-white">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-sm">{option.votes} votes</span>
                </div>
                
                <div className="mt-2">
                  <Button 
                    className={option.voters.includes(userFid) ? "" : "bg-transparent text-black border border-gray-300 hover:bg-gray-100"}
                    onClick={() => handleVote(option.id)}
                    disabled={isClosed || option.voters.includes(userFid)}
                  >
                    {option.voters.includes(userFid) ? "Voted" : "Vote"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {!isClosed && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium mb-2">Add New Option</h3>
              <div className="flex gap-2">
                <Input 
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  placeholder="Enter new option"
                />
                <Button 
                  onClick={handleAddOption}
                  disabled={loading || !newOptionText.trim()}
                  isLoading={loading}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show error and success messages
  function renderMessages() {
    return (
      <>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {success}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      {renderMessages()}
      
      {currentView === "home" && renderHome()}
      {currentView === "create" && renderCreate()}
      {currentView === "view" && renderBallotView()}
    </div>
  );
} 