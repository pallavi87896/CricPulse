"use client";

import React, { useEffect, useState } from "react";
import { TeamType } from "@/types/teamType";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import SimpleTable from "@/components/SimpleTable";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function TeamsPage() {

  const [teams,setTeams] = useState<TeamType[]>([]);

  const [name,setName] = useState("");
  const [logo,setLogo] = useState("");

  const [ editingTeam, setEditingTeam ] = useState<TeamType | null>(null);
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ isConfirmOpen, setIsConfirmOpen ] = useState(false);
  const [ deletingTeamId , setDeletingTeamId ] = useState<string | null>(null);
  const [ error, setError ]  = useState("");

  useEffect(()=>{
    const getTeam=async()=>{

      try{

      const res = await fetch ("/api/team");

      if(!res.ok) throw new Error ("failed to get teams");

      const data = await res.json();

      setTeams(data);

      }
      catch(err)
      {
        console.error(err);
      }
    }

    getTeam();
  },[]);

  const createTeam = async ()=>{
    try{
      const res = await fetch("/api/team",{
        method : "POST",
        headers : {
          "Content-Type" : "application/json",
        },
        body : JSON.stringify({
          name,
          logo
        }),
      });

      if(!res.ok) throw new Error ("cannot post team");

      const newTeam = await res.json();

      setTeams((prev)=>[...prev,newTeam]);
  }
  catch(err){
    console.error(err);
  }
}

  const updateTeam = async (id : string)=>{
    try{

    const res = await fetch ("/api/team",{
      method : "PATCH",
      headers  : {
        "Content-Type" : "application/json",
      },
      body : JSON.stringify({
        id,
        name,
        logo,
      }),
    });

    if(!res.ok){
      throw new Error("failed to update team");
    }

    const updatedTeam = await res.json();

    setTeams((prev) => prev.map((team) => team._id === updatedTeam._id ? updatedTeam : team)
  );
  }
  catch(err){
    console.error(err);
  }
}

const handleAdd=()=>{
  setEditingTeam(null);
  setName("");
  setLogo("");
  setError("");
  setIsModalOpen(true);
}

const handleEdit=(team:TeamType)=>{
  setEditingTeam(team);
  setName(team.name);
  setLogo(team.logo || "");
  setError("");
  setIsModalOpen(true);
}

const handleSave=async (e : React.FormEvent)=>{
  e.preventDefault();

  if(!name.trim()){
    setError("Team name is required");
    return;
  }

  if(editingTeam){
    await updateTeam(editingTeam._id);
  }
  else{
    await createTeam();
  }
  setIsModalOpen(false);
  setName("");
  setLogo("");
  setEditingTeam(null);
}

const handleDelete = (id:string)=>{
  setDeletingTeamId(id);
  setIsConfirmOpen(true);
}

const handleConfirmDelete=async()=>{
  if(deletingTeamId){
    await deleteTeam(deletingTeamId);
    setDeletingTeamId(null);
    setIsConfirmOpen(false);
  }
}

const deleteTeam = async ( id : string)=>{
  try{
    const res = await fetch("/api/team",{
      method : "DELETE",
      headers : {
        "Content-type" : "application/json",
      },
      body : JSON.stringify({
        id
      }),
    });

    if(!res.ok){
      throw new Error("could not delete");
    }

    setTeams((prev) => prev.filter((teams) => teams._id !== id));
  }
  catch(err){
    console.error(err);
  }
}


  const formFooter = (
    <>
      <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" form="team-form">
        {editingTeam ? "Save Changes" : "Add Team"}
      </Button>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Teams"
        description="Manage the list of participating cricket teams and their logos."
        actions={
          <Button variant="primary" onClick={handleAdd}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Team
          </Button>
        }
      />

      {/* Teams Table */}
      <SimpleTable
        headers={["Logo", "Name", "Actions"]}
        isEmpty={teams.length === 0}
      >
        {teams.map((team) => (
          <tr key={team._id} className="hover:bg-zinc-50/50">
            <td className="px-6 py-4 whitespace-nowrap text-2xl w-24">
              {team.logo || "🏏"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-950">
              {team.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap w-48">
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleEdit(team)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(team._id)}>
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </SimpleTable>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeam ? "Edit Team" : "Add Team"}
        footer={formFooter}
        size="sm"
      >
        <form id="team-form" onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Team Name"
            placeholder="e.g. India"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
          />
          <Input
            label="Logo (Emoji / Symbol)"
            placeholder="e.g. 🇮🇳 or 🏏"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
          />
        </form>
      </Modal>

      {/* Deletion confirmation */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Team"
        message="Are you sure you want to delete this team? All players belonging to this team will also be deleted. This action cannot be undone."
      />
    </div>
  );
}
