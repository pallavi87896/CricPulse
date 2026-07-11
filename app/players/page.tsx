"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import SimpleTable from "@/components/SimpleTable";
import Modal from "@/components/Modal";
import Input, { Select } from "@/components/Input";
import ConfirmationModal from "@/components/ConfirmationModal";
import { PlayerType } from "@/types/playerType";
import { TeamType } from "@/types/teamType";


export default function PlayersPage() {

  // Modal and Confirmation states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Selected items
  const [editingPlayer, setEditingPlayer] = useState<PlayerType | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [team, setTeam] = useState("");

  const [players,setPlayers] = useState<PlayerType[]>([]);
  const [teams,setTeams] = useState<TeamType[]>([]);
  
  // Form errors
  const [nameError, setNameError] = useState("");
  const [teamError, setTeamError] = useState("");

  const roleOptions = [
  { label: "Batsman", value: "Batsman" },
  { label: "Bowler", value: "Bowler" },
  { label: "All-Rounder", value: "All-Rounder" },
  { label: "Wicket Keeper", value: "Wicket Keeper" },
  ];

  const teamOptions = teams.map((team)=>({
    label:team.name,
    value:team._id
  }));

  const handleAdd=()=>{
    setEditingPlayer(null);
    setName("");
    setRole("");
    setTeam("");
    setNameError("");
    setTeamError("");
    setIsModalOpen(true);
  };

  const handleEdit=(player:PlayerType)=>{
    setEditingPlayer(player);
    setName(player.name);
    setRole(player.role || "");
    setTeam(player.team._id);
    setNameError("");
    setTeamError("");
    setIsModalOpen(true);

  }

  const handleSave=async(e:React.FormEvent)=>{
    e.preventDefault();

    if(!name.trim()){
      setNameError("player name is required");
      return;
    }
    if(!team.trim()){
      setTeamError("team name is required");
      return;
    }
    if(editingPlayer){
      await updatedPlayer(editingPlayer._id)
    }
    else{
      await createdPlayer();
    }

    setIsModalOpen(false);
    setEditingPlayer(null);
    setName("");
    setRole("");
    setTeam("");

  }

  const handleDelete=( id : string )=>{
    setDeletingPlayerId(id);
    setIsConfirmOpen(true);
  }

  const handleConfirmDelete=async()=>{
    if(deletingPlayerId){
    await deletedPlayer(deletingPlayerId);
    setDeletingPlayerId(null);
    setIsConfirmOpen(false);
    }
  }

  useEffect(()=>{
    const getPlayer=async()=>{
      try{
        const res = await fetch ("/api/player")

        const data = await res.json();

        if(!res.ok) throw new Error("cannot get players");

        setPlayers(data);
    }
    catch(err){
      console.error(err);
    }
  }

  const getTeam=async()=>{
      try{
        const res = await fetch ("/api/team")

        const data = await res.json();

        if(!res.ok) throw new Error("cannot get players");

        setTeams(data);
    }
    catch(err){
      console.error(err);
    }
  }

  getTeam();
  getPlayer();

},[])


  const updatedPlayer = async (id : string)=>{
      try{

      const res = await fetch ("/api/player",{
        method : "PATCH",
        headers  : {
          "Content-Type" : "application/json",
        },
        body : JSON.stringify({
          id,
          name,
          role,
          team,
        }),
      });

      if(!res.ok){
        throw new Error("failed to update player");
      }

      const updatedPlayer = await res.json();

      setNameError("");
      setTeamError("");

      setPlayers((prev) => prev.map((player) => (player._id === updatedPlayer._id) ? updatedPlayer : player)
    );
    }
    catch(err){
      console.error(err);
    }
  }

  const deletedPlayer = async (id : string)=>{
    try{
      const res = await fetch("/api/player",{
         method : "DELETE",
        headers: {
          "Content-Type" : "application/json",
        },
        body : JSON.stringify({
          id,
        })
      })

      if(!res.ok){
        throw new Error("failed to delete player");
      }

      setPlayers((prev)=> prev.filter((player)=>player._id !==id));
    }
    catch(err)
    {
      console.error(err);
    }
  }

  const createdPlayer = async ()=>{
    try{
      const res = await fetch("/api/player",{
         method : "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body:JSON.stringify({
          name,
          role,
          team,
        })
      });

      if(!res.ok){
        throw new Error("failed to create player");
      }

      const newPlayer = await res.json();

      setNameError("");
      setTeamError("");

      setPlayers((prev)=>[...prev,newPlayer])
    }
    catch(err)
    {
      console.error(err);
    }
  }



  const formFooter = (
    <>
      <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" form="player-form">
        {editingPlayer ? "Save Changes" : "Add Player"}
      </Button>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Players"
        description="Configure roles and team affiliations for your players database."
        actions={
          <Button variant="primary" onClick={handleAdd} disabled={teams.length === 0}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Player
          </Button>
        }
      />

      {teams.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
          <svg className="w-12 h-12 mx-auto text-zinc-350 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-zinc-900">No teams available</h3>
          <p className="mt-1 text-xs text-zinc-500">Please create a Team before adding any players.</p>
        </div>
      ) : (
        <SimpleTable
          headers={["Name", "Role", "Team", "Actions"]}
          isEmpty={players.length === 0}
        >
          {players.map((player) => (
            <tr key={player._id} className="hover:bg-zinc-50/50">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-950">
                {player.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-zinc-550 font-semibold">
                {player.role || "Player"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-zinc-900">
                <div className="flex items-center gap-1.5">
                  <span>{player.team.logo}</span>
                  <span>{player.team.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap w-48">
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(player)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(player._id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </SimpleTable>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlayer ? "Edit Player" : "Add Player"}
        footer={formFooter}
        size="sm"
      >
        <form id="player-form" onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Player Name"
            placeholder="e.g. Virat Kohli"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
          />
          
          <Select
            label="Role"
            options={roleOptions}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <Select
            label="Associated Team"
            options={teamOptions}
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            error={teamError}
          />
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Player"
        message="Are you sure you want to delete this player? This will remove them from the database. Scoring averages and historical stats associated with this player ID will no longer resolve."
      />
    </div>
  );
}
