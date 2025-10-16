"use client";

import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AddPlayers from "@/components/score/AddPlayers";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeftRight, Trophy } from "lucide-react";

// Import refactored components
import Scoreboard from "./Scoreboard";
import PlayerCard from "./PlayerCard";
import TimeoutsPanel from "./TimeoutsPanel";
import PlayerList from "./PlayerList";
import StatsPanel from "./StatsPanel";
import GameSummary from "./GameSummary";

interface GameScoringProps {
  currentGame: any;
  allPlayers: any[];
}

const GameScoring = ({ currentGame, allPlayers }: GameScoringProps) => {
  const [startScore, setStartScore] = useState(currentGame.status);
  const [isTeamsSwitched, setIsTeamsSwitched] = useState(false);

  const homeTeamHasStats = currentGame.homeTeam.seasonStatistics.some(
    (stats: any) =>
      stats.gameId === currentGame._id || stats.game === currentGame._id
  );

  const awayTeamHasStats = currentGame.awayTeam.seasonStatistics.some(
    (stats: any) =>
      stats.gameId === currentGame._id || stats.game === currentGame._id
  );

  const bothTeamsHaveStats = homeTeamHasStats && awayTeamHasStats;
  const [isSummary, setIsSummary] = useState(bothTeamsHaveStats);

  const [players, setPlayers] = useState([...allPlayers]);
  const [chosenPlayerId, setChosenPlayerId] = useState(
    currentGame.homeTeam.players[0]?._id
  );
  const [currentPlayerBgColor, setCurrentPlayerBgColor] = useState("#1E40AF");

  const playersPlayed = players.filter((player) => {
    return player?.allStats.find((stat: any) => {
      return stat.game === currentGame._id && stat.pointsString !== undefined;
    });
  });

  const [checkedPlayers, setCheckedPlayers] = useState(playersPlayed);

  const player = checkedPlayers.find((player) => player._id === chosenPlayerId);

  const statistics = player?.allStats.find((stat: any) => {
    return stat.game === currentGame._id && stat.pointsString !== undefined;
  });

  const [totalScores, setTotalScores] = useState({
    home: {
      id: currentGame.homeTeam._id,
      score: currentGame.homeTeamScore,
    },
    away: {
      id: currentGame.awayTeam._id,
      score: currentGame.awayTeamScore,
    },
  });

  const [gameWinner, setGameWinner] = useState(
    currentGame.homeTeamScore > currentGame.awayTeamScore
      ? currentGame.homeTeam.teamName
      : currentGame.awayTeam.teamName
  );

  const [playerOfTheGame, setPlayerOfTheGame] = useState(
    players.find((player) => player._id === currentGame.playerOfTheGame?._id)
  );

  const handleStopGameScoring = () => {
    setStartScore(false);
  };

  // Function to increment a specific stat
  const incrementStat = async (statName: string) => {
    try {
      const updatedPlayers = [...checkedPlayers];
      const playerIndex = updatedPlayers.findIndex(
        (player) => player._id === chosenPlayerId
      );

      if (playerIndex !== -1) {
        const statistics = updatedPlayers[playerIndex].allStats.find(
          (stat: any) => {
            return (
              stat.game === currentGame._id && stat.pointsString !== undefined
            );
          }
        );
        statistics[statName]++;

        const response = await fetch(
          `/api/v1/scorekeeper/${currentGame._id}/player-stats`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chosenPlayer: updatedPlayers[playerIndex]._id,
              statistics: statistics,
              points: false,
            }),
          }
        );

        const { player } = await response.json();
        updatedPlayers[playerIndex] = player;

        toast.custom((id) => (
          <div
            onClick={() => toast.dismiss(id)}
            className="p-3 bg-blue-500 text-white rounded-lg shadow-md cursor-pointer"
          >
            #{player.jerseyNumber} {player.playerName} now has{" "}
            {statistics[statName]}{" "}
            {statistics[statName] === 1 ? statName : `${statName}s`}
          </div>
        ));

        setCheckedPlayers(updatedPlayers);
        handleTeamGameStats(updatedPlayers);
      }
    } catch (error) {
      console.error("Error updating player game stats:", error);
    }
  };

  // Function to decrement a specific stat
  const decrementStat = async (statName: string) => {
    try {
      const updatedPlayers = [...checkedPlayers];
      const playerIndex = updatedPlayers.findIndex(
        (player) => player._id === chosenPlayerId
      );

      if (playerIndex !== -1) {
        const statistics = updatedPlayers[playerIndex].allStats.find(
          (stat: any) => {
            return (
              stat.game === currentGame._id && stat.pointsString !== undefined
            );
          }
        );

        if (statistics[statName] > 0) {
          statistics[statName]--;
          const response = await fetch(
            `/api/v1/scorekeeper/${currentGame._id}/player-stats`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chosenPlayer: updatedPlayers[playerIndex]._id,
                statistics: statistics,
                points: false,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to decrement stat");
          }

          const { player } = await response.json();
          updatedPlayers[playerIndex] = player;
          setCheckedPlayers(updatedPlayers);
          handleTeamGameStats(updatedPlayers);
        }
      }
    } catch (error) {
      console.error("Error decrementing stat:", error);
    }
  };

  const incrementPoint = async (point: number) => {
    const updatedPlayers = [...checkedPlayers];
    const playerIndex = updatedPlayers.findIndex(
      (player) => player._id === chosenPlayerId
    );

    if (playerIndex !== -1) {
      const statistics = updatedPlayers[playerIndex].allStats.find(
        (stat: any) => {
          return (
            stat.game === currentGame._id && stat.pointsString !== undefined
          );
        }
      );
      statistics.pointsString += ` ${point}`;
      const pointsArray = statistics.pointsString.split(" ").map(Number);
      let ones = 0;
      let twos = 0;
      let threes = 0;

      pointsArray.forEach((point: number) => {
        if (point === 1) {
          ones += 1;
        } else if (point === 2) {
          twos += 2;
        } else if (point === 3) {
          threes += 3;
        }
      });

      const totalOnes = ones;
      const totalTwos = twos;
      const totalThrees = threes;

      statistics.points = totalOnes + totalTwos + totalThrees;
      statistics.threesMade = totalThrees / 3;
      statistics.twosMade = totalTwos / 2;
      statistics.freeThrowsMade = totalOnes;

      updatedPlayers[playerIndex].allStats = updatedPlayers[
        playerIndex
      ].allStats.map((stat: any) => {
        if (stat.game === currentGame._id) {
          return statistics;
        }
        return stat;
      });

      const homeTeamPlayers = checkedPlayers.filter(
        (player) =>
          player.teamId === currentGame.homeTeam._id ||
          player.team === currentGame.homeTeam._id
      );
      const awayTeamPlayers = checkedPlayers.filter(
        (player) =>
          player.teamId === currentGame.awayTeam._id ||
          player.team === currentGame.awayTeam._id
      );

      const homeTeamStats = homeTeamPlayers.map((player) => {
        const stats = player.allStats.find(
          (stat: any) => stat.game === currentGame._id
        );
        return stats ? stats.points : 0;
      });

      const awayTeamStats = awayTeamPlayers.map((player) => {
        const stats = player.allStats.find(
          (stat: any) => stat.game === currentGame._id
        );
        return stats ? stats.points : 0;
      });

      const homeTeamTotalPoints = homeTeamStats.reduce(
        (total, points) => total + points,
        0
      );
      const awayTeamTotalPoints = awayTeamStats.reduce(
        (total, points) => total + points,
        0
      );

      const response = await fetch(
        `/api/v1/scorekeeper/${currentGame._id}/player-stats`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chosenPlayer: updatedPlayers[playerIndex]._id,
            statistics: statistics,
            points: true,
            updatedTotalScores: {
              home: homeTeamTotalPoints,
              away: awayTeamTotalPoints,
            },
          }),
        }
      );

      const { player, scores } = await response.json();
      updatedPlayers[playerIndex] = player;

      toast.custom((t) => (
        <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md flex items-center gap-3">
          <span className="font-semibold">
            #{player.jerseyNumber} {player.playerName}
          </span>
          <span>
            {point} {point === 1 ? "point" : "points"}
          </span>
        </div>
      ));

      setCheckedPlayers(updatedPlayers);
      handleTeamGameStats(updatedPlayers);
      if (scores) {
        setTotalScores({
          home: {
            id: currentGame.homeTeam._id,
            score: scores.home,
          },
          away: {
            id: currentGame.awayTeam._id,
            score: scores.away,
          },
        });
      }
    }
  };

  const decrementPoint = async () => {
    const updatedPlayers = [...checkedPlayers];
    const playerIndex = updatedPlayers.findIndex(
      (player) => player._id === chosenPlayerId
    );

    if (playerIndex !== -1) {
      const statistics = updatedPlayers[playerIndex].allStats.find(
        (stat: any) => {
          return (
            stat.game === currentGame._id && stat.pointsString !== undefined
          );
        }
      );

      const newPointsString = statistics.pointsString
        .replace(/\s/g, "")
        .slice(0, -1)
        .split("")
        .join(" ");

      const pointsArray = newPointsString.split(" ").map(Number);
      let ones = 0;
      let twos = 0;
      let threes = 0;

      pointsArray.forEach((point: number) => {
        if (point === 1) {
          ones += 1;
        } else if (point === 2) {
          twos += 2;
        } else if (point === 3) {
          threes += 3;
        }
      });

      const totalOnes = ones;
      const totalTwos = twos;
      const totalThrees = threes;

      statistics.points = totalOnes + totalTwos + totalThrees;
      statistics.threesMade = totalThrees / 3;
      statistics.twosMade = totalTwos / 2;
      statistics.freeThrowsMade = totalOnes;

      statistics.pointsString = newPointsString;
      updatedPlayers[playerIndex].allStats = updatedPlayers[
        playerIndex
      ].allStats.map((stat: any) => {
        if (stat.game === currentGame._id) {
          return statistics;
        }
        return stat;
      });

      setCheckedPlayers(updatedPlayers);

      if (statistics.points >= 0) {
        const homeTeamPlayers = checkedPlayers.filter(
          (player) =>
            player.teamId === currentGame.homeTeam._id ||
            player.team === currentGame.homeTeam._id
        );
        const awayTeamPlayers = checkedPlayers.filter(
          (player) =>
            player.teamId === currentGame.awayTeam._id ||
            player.team === currentGame.awayTeam._id
        );

        const homeTeamStats = homeTeamPlayers.map((player) => {
          const stats = player.allStats.find(
            (stat: any) => stat.game === currentGame._id
          );
          return stats ? stats.points : 0;
        });

        const awayTeamStats = awayTeamPlayers.map((player) => {
          const stats = player.allStats.find(
            (stat: any) => stat.game === currentGame._id
          );
          return stats ? stats.points : 0;
        });

        const homeTeamTotalPoints = homeTeamStats.reduce(
          (total, points) => total + points,
          0
        );
        const awayTeamTotalPoints = awayTeamStats.reduce(
          (total, points) => total + points,
          0
        );

        const response = await fetch(
          `/api/v1/scorekeeper/${currentGame._id}/player-stats`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chosenPlayer: updatedPlayers[playerIndex]._id,
              statistics: statistics,
              points: true,
              updatedTotalScores: {
                home: homeTeamTotalPoints,
                away: awayTeamTotalPoints,
              },
            }),
          }
        );

        const { player, scores } = await response.json();
        updatedPlayers[playerIndex] = player;

        setCheckedPlayers(updatedPlayers);
        handleTeamGameStats(updatedPlayers);

        if (scores) {
          setTotalScores({
            home: {
              id: currentGame.homeTeam._id,
              score: scores.home,
            },
            away: {
              id: currentGame.awayTeam._id,
              score: scores.away,
            },
          });
        }
      }
    }
  };

  const handlePlayerChange = (id: string, color: string) => {
    setChosenPlayerId(id);
    setCurrentPlayerBgColor(color);
  };

  const handleAddNewPlayer = async (
    playerName: string,
    jerseyNumber: number,
    selectedTeam: string,
    selectedDivision: string,
    instagram: string
  ) => {
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName,
          jerseyNumber,
          team: selectedTeam,
          division: selectedDivision,
          instagram,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to add player");
      }
      const newPlayer = await res.json();
      setPlayers([...players, newPlayer.player]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleTeamGameStats = async (players: any[]) => {
    try {
      const homeTeamPlayers = players.filter(
        (player) =>
          player.teamId === currentGame.homeTeam._id ||
          player.team === currentGame.homeTeam._id
      );
      const awayTeamPlayers = players.filter(
        (player) =>
          player.teamId === currentGame.awayTeam._id ||
          player.team === currentGame.awayTeam._id
      );

      let homeTeamStats = {
        points: 0,
        rebounds: 0,
        assists: 0,
        blocks: 0,
        steals: 0,
        threesMade: 0,
        twosMade: 0,
        freeThrowsMade: 0,
      };

      let awayTeamStats = {
        points: 0,
        rebounds: 0,
        assists: 0,
        blocks: 0,
        steals: 0,
        threesMade: 0,
        twosMade: 0,
        freeThrowsMade: 0,
      };

      homeTeamPlayers.forEach((player) => {
        const stats = player.allStats.find(
          (stat: any) => stat.game.toString() === currentGame._id.toString()
        );
        if (stats) {
          homeTeamStats.points += stats.points || 0;
          homeTeamStats.rebounds += stats.rebounds || 0;
          homeTeamStats.assists += stats.assists || 0;
          homeTeamStats.blocks += stats.blocks || 0;
          homeTeamStats.steals += stats.steals || 0;
          homeTeamStats.threesMade += stats.threesMade || 0;
          homeTeamStats.twosMade += stats.twosMade || 0;
          homeTeamStats.freeThrowsMade += stats.freeThrowsMade || 0;
        }
      });

      awayTeamPlayers.forEach((player) => {
        const stats = player.allStats.find(
          (stat: any) => stat.game.toString() === currentGame._id.toString()
        );
        if (stats) {
          awayTeamStats.points += stats.points || 0;
          awayTeamStats.rebounds += stats.rebounds || 0;
          awayTeamStats.assists += stats.assists || 0;
          awayTeamStats.blocks += stats.blocks || 0;
          awayTeamStats.steals += stats.steals || 0;
          awayTeamStats.threesMade += stats.threesMade || 0;
          awayTeamStats.twosMade += stats.twosMade || 0;
          awayTeamStats.freeThrowsMade += stats.freeThrowsMade || 0;
        }
      });

      const teamStatistics = {
        homeTeam: {
          ...homeTeamStats,
          teamId: currentGame.homeTeam._id,
          gameId: currentGame._id,
          game: currentGame._id,
        },
        awayTeam: {
          ...awayTeamStats,
          teamId: currentGame.awayTeam._id,
          gameId: currentGame._id,
          game: currentGame._id,
        },
      };

      const response = await fetch(
        `/api/v1/scorekeeper/${currentGame._id}/team-stats`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ statistics: teamStatistics }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update team statistics");
      }
    } catch (error) {
      console.error("Error updating team statistics:", error);
    }
  };

  const handleFinishGameScoring = async () => {
    try {
      const response = await fetch(
        `/api/v1/scorekeeper/${currentGame._id}/finish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            homeTeamId: currentGame.homeTeam._id,
            awayTeamId: currentGame.awayTeam._id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to finish game");
      }

      const { gameWinner, playerOfTheGame } = await response.json();

      if (gameWinner) {
        setGameWinner(gameWinner.teamName);
      }
      setPlayerOfTheGame(playerOfTheGame);

      setIsSummary(true);
    } catch (error) {
      console.error("Error finishing game:", error);
    }
  };

  const [selectedPlayerOfTheGame, setSelectedPlayerOfTheGame] = useState("");

  const handlePlayerOfTheGameChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedPlayerId = event.target.value;
    setPlayerOfTheGame(
      players.find((player) => player._id === selectedPlayerId)
    );

    try {
      const response = await fetch(
        `/api/v1/scorekeeper/${currentGame._id}/player-of-game`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId: selectedPlayerId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update player of the game");
      }

      console.log("Player of the game updated successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const [homeTimeouts, setHomeTimeouts] = useState({
    firstHalf: 2,
    secondHalf: 2,
  });
  const [awayTimeouts, setAwayTimeouts] = useState({
    firstHalf: 2,
    secondHalf: 2,
  });

  const handleHomeClick = (half: "firstHalf" | "secondHalf") => {
    setHomeTimeouts((prev) => ({
      ...prev,
      [half]: prev[half] - 1,
    }));
  };

  const handleAwayClick = (half: "firstHalf" | "secondHalf") => {
    setAwayTimeouts((prev) => ({
      ...prev,
      [half]: prev[half] - 1,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* MODERN SCOREBOARD */}
      <Scoreboard
        homeTeam={currentGame.homeTeam}
        awayTeam={currentGame.awayTeam}
        homeScore={totalScores.home.score}
        awayScore={totalScores.away.score}
        isTeamsSwitched={isTeamsSwitched}
      />

      {!isSummary && (
        <div className="max-w-7xl mx-auto p-4 space-y-4">
          {/* Team Switch Button */}
          <Card>
            <CardContent className="p-3">
              <Button
                onClick={() => setIsTeamsSwitched(!isTeamsSwitched)}
                variant="outline"
                className="w-full hover:bg-slate-100"
              >
                <ArrowLeftRight className="w-5 h-5 mr-2" />
                Switch Sides
              </Button>
            </CardContent>
          </Card>

          {startScore && (
            <>
              {/* SELECTED PLAYER CARD */}
              <PlayerCard player={player} bgColor={currentPlayerBgColor} />

              {/* TIMEOUTS CARD */}
              <TimeoutsPanel
                homeTeam={currentGame.homeTeam}
                awayTeam={currentGame.awayTeam}
                homeTimeouts={homeTimeouts}
                awayTimeouts={awayTimeouts}
                onHomeClick={handleHomeClick}
                onAwayClick={handleAwayClick}
                isTeamsSwitched={isTeamsSwitched}
              />

              {/* MAIN SCORING INTERFACE */}
              <div
                className={`grid lg:grid-cols-4 gap-4 ${
                  isTeamsSwitched ? "flex flex-row-reverse" : ""
                }`}
              >
                {/* HOME TEAM PLAYERS */}
                <PlayerList
                  players={checkedPlayers}
                  teamId={currentGame.homeTeam._id}
                  teamNameShort={currentGame.homeTeam.teamNameShort}
                  chosenPlayerId={chosenPlayerId}
                  onPlayerChange={handlePlayerChange}
                  color="#1E40AF"
                />

                {/* STATS CENTER PANEL */}
                <StatsPanel
                  statistics={statistics}
                  onIncrementPoint={incrementPoint}
                  onDecrementPoint={decrementPoint}
                  onIncrementStat={incrementStat}
                  onDecrementStat={decrementStat}
                />

                {/* AWAY TEAM PLAYERS */}
                <PlayerList
                  players={checkedPlayers}
                  teamId={currentGame.awayTeam._id}
                  teamNameShort={currentGame.awayTeam.teamNameShort}
                  chosenPlayerId={chosenPlayerId}
                  onPlayerChange={handlePlayerChange}
                  color="#EA580C"
                />
              </div>

              {/* ACTION BUTTONS */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button
                    onClick={handleFinishGameScoring}
                    className="w-full h-12 text-base font-semibold bg-red-600 hover:bg-red-700"
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    Finish Game
                  </Button>
                  <Button
                    onClick={handleStopGameScoring}
                    variant="outline"
                    className="w-full h-12 text-base font-semibold"
                  >
                    Back to Player Selection
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {!startScore && (
            <AddPlayers
              players={players}
              checkedPlayers={checkedPlayers}
              onAddNewPlayer={handleAddNewPlayer}
              currentGame={currentGame}
              setPlayers={setPlayers}
              setCheckedPlayers={setCheckedPlayers}
              setStartScore={setStartScore}
              setIsSummary={setIsSummary}
            />
          )}
        </div>
      )}

      {isSummary && (
        <GameSummary
          gameWinner={gameWinner}
          players={players}
          checkedPlayers={checkedPlayers}
          homeTeamId={currentGame.homeTeam._id}
          awayTeamId={currentGame.awayTeam._id}
          homeTeamNameShort={currentGame.homeTeam.teamNameShort}
          awayTeamNameShort={currentGame.awayTeam.teamNameShort}
          gameId={currentGame._id}
          playerOfTheGame={playerOfTheGame}
          selectedPlayerOfTheGame={selectedPlayerOfTheGame}
          onPlayerOfTheGameChange={handlePlayerOfTheGameChange}
          onBackToScoring={() => setIsSummary(false)}
          isTeamsSwitched={isTeamsSwitched}
        />
      )}

      <Toaster />
    </div>
  );
};

export default GameScoring;
