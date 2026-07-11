"use client";
import SimpleTable from "@/components/SimpleTable";
import  { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { MatchType } from "@/types/matchType";
import { TeamType } from "@/types/teamType";
import { MatchFormType } from "@/types/matchFormType";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import Input, { Select } from "@/components/Input";
import ConfirmationModal from "@/components/ConfirmationModal";
export default function MatchPage(){

  const [matches,setMatches] = useState<MatchType[]>([]);
  const [teams,setTeams] = useState<TeamType[]>([]);
  const [loading,setLoading] = useState(false);
  const [battingTeam, setBattingTeam] = useState("");
  const [bowlingTeam, setBowlingTeam] = useState("");


  //for view
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [viewingMatch, setViewingMatch] = useState<MatchType | null>(null);

  const handleOpenView = (match: MatchType) => {
  setViewingMatch(match);
  setIsViewOpen(true);
  };
  const [isModalOpen,setIsModalOpen] = useState(false);
  const [editingMatch,setEditingMatch] = useState<MatchType | null>(null);

  const initialFormData: MatchFormType = {
  teamA: "",
  teamB: "",
  tossWinner: "",
  tossDecision: "Bat",
  venue: "",
  overs: 20,
  dateTime: "",
  status: "Upcoming",
  
};

const [formData, setFormData] = useState(initialFormData);

  const [ isConfirmationModal , setIsConfirmationModal ] = useState(false);
  //for the popup warning
  const [ deleteMatch , setDeleteMatch ] = useState<MatchType | null>(null);
  //for finding the match to be deleted 

  const handleDelete = (match : MatchType)=>{
    setIsConfirmationModal(true);
    setDeleteMatch(match);
  }
  //

  const deletingMatch =async ()=>{
     if(!deleteMatch) return;
    try{
      const res = await fetch("/api/match",{
        method: "DELETE",
        headers: {
          "Content-type" : "application/json"
        },
        body : JSON.stringify({id : deleteMatch._id,})
      }); 

      if(!res.ok) throw new Error ("match cannot be deleted");

      setIsConfirmationModal(false);
      setDeleteMatch(null);
      loadData();
    }

    catch(err)
    {
      console.error(err);
    }
  }
  

  const handleAddMatch=()=>{
    setFormData(initialFormData);
    setEditingMatch(null);
    setIsModalOpen(true);
  }

  const createMatch= async ()=>{
    try{

      const res = await fetch("/api/match",{
        method: "POST",
        headers: {"Content-type" : "application/json"},
        body:JSON.stringify(formData)

      });

       const data = await res.json();
    console.log(data); 

      if(!res.ok) throw new Error("cannot post the match");

      setIsModalOpen(false);

          setFormData(initialFormData)

      loadData();
    }
    catch(err){
      console.error(err);
    }

  }

  const updateMatch=async()=>{
    if(!editingMatch) return;

    try{
      const res = await fetch("/api/match",{
        method : "PATCH",
        headers: {"Content-type" : "application/json"},
        body : JSON.stringify({id: editingMatch._id,
          ...formData
        })
      });

       if (!res.ok) {
          throw new Error("Failed to update match");
        }
      const updated = await res.json();

      setIsModalOpen(false);
      setEditingMatch(null);
      setFormData(initialFormData);

      loadData();

    }
    catch(err)
    {
      console.error(err);
    }
  };

  const handleEditMatch= async (match : MatchType)=>{
    setEditingMatch(match);
    setFormData({ teamA:match.teamA._id,
    teamB:match.teamB._id,
    tossWinner:match.tossWinner._id,
    tossDecision:match.tossDecision,
    venue:match.venue ?? "",
    overs:match.overs,
    dateTime:match.dateTime ? new Date(match.dateTime).toISOString().slice(0,16):"",
    status:match.status,
    
    });
    setIsModalOpen(true);

  }

  const handleSave = async() => {

      //validation

  if (!formData.teamA) {
    alert("Select Team A");
    return;
    }

    if (!formData.teamB) {
        alert("Select Team B");
        return;
    }

    if (formData.teamA === formData.teamB) {
        alert("Teams cannot be same");
        return;
    }

    if (!formData.tossWinner) {
        alert("Select toss winner");
        return;
    }


    if(editingMatch){
      await updateMatch();
    }
    else{
      await createMatch();
    }
  };




    const loadData=async()=>{
       try{
        setLoading(true);
      const res1 = await fetch("/api/match");

      if(!res1.ok){
        throw new Error("failed to get matches")
      }

      const data1 = await res1.json();

      setMatches(data1);

      const res = await fetch("/api/team");

      if(!res.ok){
        throw new Error("failed to get teams")
      }

      const data = await res.json();

      setTeams(data);
    }
    catch(err){
    console.error(err);
  }
  finally{
    setLoading(false);
  }
    
  }
  
    

    useEffect(()=>{
    loadData();
    },[])

    const teamOptions = teams?.map((team)=>({
      value:team._id,
      label:`${team.logo} ${team.name}`
    })) ?? [];

    const tossWinnerOptions = [{
      value: formData.teamA,
      label: teams?.find((t)=>t._id === formData.teamA)?.name || "",

    },
    {
      value: formData.teamB,
      label: teams?.find((t)=>t._id===formData.teamB)?.name || "",
    }].filter((item)=>item.value);

    

    useEffect(() => {
      if (
        !formData.teamA ||
        !formData.teamB ||
        !formData.tossWinner
      ) {
        setBattingTeam("");
        setBowlingTeam("");
        return;
      }

      if (formData.tossDecision === "Bat") {
        setBattingTeam(formData.tossWinner);
        setBowlingTeam(
          formData.tossWinner === formData.teamA
            ? formData.teamB
            : formData.teamA
        );
      } else {
        setBowlingTeam(formData.tossWinner);
        setBattingTeam(
          formData.tossWinner === formData.teamA
            ? formData.teamB
            : formData.teamA
        );
      }
    }, [
      formData.teamA,
      formData.teamB,
      formData.tossWinner,
      formData.tossDecision,
  ]);


  const createFooter = (
    <>
      <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" form="create-match-form">
        {editingMatch ? "Update Match" : "Create Match"}
      </Button>
    </>
  );

  if (loading) {
    return <div>Loading...</div>;
  } 
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Matches"
        description="Schedule and configure cricket matches, including venue and starter configurations."
        actions={
          <Button variant="primary" onClick={handleAddMatch} disabled={teams.length < 2}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Match
          </Button>
        }
      />

      {/* Matches List Table */}
      <SimpleTable
        headers={["Teams", "Venue", "Overs", "Status", "Date / Time", "Actions"]}
        isEmpty={matches.length === 0}
      >
        {matches.map((match) => (
          <tr key={match._id} className="hover:bg-zinc-50/50">
            <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-950">
              <div className="flex items-center gap-2">
                <span>{match.teamA.logo} {match.teamA.name}</span>
                <span className="text-zinc-400 font-semibold text-xs">vs</span>
                <span>{match.teamB.logo} {match.teamB.name}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-zinc-550">
              {match.venue || "TBD"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-zinc-650 font-mono">
              {match.overs}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge status={match.status} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-zinc-500 font-medium">
              {match.dateTime ? new Date(match.dateTime).toLocaleString() : "Upcoming"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap w-48">
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleOpenView(match)}>
                  View
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleEditMatch(match)}>
                    Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(match)}>
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </SimpleTable>

      {/* Create Match Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMatch ? "Edit Match" : "Create Match"}
        footer={createFooter}
        size="lg"
      >
        <form id="create-match-form" onSubmit={(e) => {
        e.preventDefault();
        handleSave();
        }}className="flex flex-col gap-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Team A"
              options={teamOptions}
              value={formData.teamA}
              onChange={(e) => {
                setFormData({
                ...formData,
                teamA: e.target.value,
                tossWinner:
                    formData.tossWinner || e.target.value,})
              }}
            />
            <Select
              label="Team B"
              options={teamOptions}
              value={formData.teamB}
              onChange={(e) => setFormData({...formData,teamB:e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Toss Winner"
              options={tossWinnerOptions}
              value={formData.tossWinner}
              onChange={(e) => setFormData({...formData,tossWinner:e.target.value})}
            />
            <Select
              label="Toss Decision"
              options={[
                { value: "Bat", label: "Bat first" },
                { value: "Bowl", label: "Bowl first" },
              ]}
              value={formData.tossDecision}
              onChange={(e) => setFormData({...formData,tossDecision:e.target.value as "Bat"|"Bowl"})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Venue"
              placeholder="e.g. Wankhede Stadium"
              value={formData.venue}
              onChange={(e) => setFormData({...formData,venue:e.target.value })}
            />
            <Input
              label="Overs Limit"
              type="number"
              min="1"
              max="50"
              value={formData.overs}
              onChange={(e) => setFormData({...formData,overs:Number(e.target.value)})}
            />
            <Select
              label="Status"
              options={[
                { value: "Upcoming", label: "Upcoming" },
                { value: "Live", label: "Live" },
                { value: "Ended", label: "Ended" },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as "Live" | "Upcoming" | "Ended"})}
            />
          </div>

          <Input
            label="Match Date & Time"
            type="datetime-local"
            value={formData.dateTime}
            onChange={(e) => setFormData({...formData,dateTime:e.target.value}
            )}
          />

          {/* Dynamic player fields derived from batting and bowling team */}
          {battingTeam && bowlingTeam && (
            <div className="mt-2 border-t border-zinc-150 pt-4 flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-550">Starter Setup</h4>
              
              <div className="bg-zinc-50 p-3.5 border border-zinc-200 rounded-md text-xs text-zinc-600 flex flex-col gap-1">
                <p>
                  🏏 <strong>Batting First:</strong> {
                    teams.find(team=>team._id===battingTeam)?.name
                    }
                </p>
                <p>
                  ⚾ <strong>Bowling First:</strong> {teams.find(team=>team._id===bowlingTeam)?.name
                    }
                </p>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* View Modal Detail Panel */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => {
    setIsViewOpen(false);
    setViewingMatch(null);
     }}
                title="Match Details Preview"
        size="md"
      >
        {viewingMatch && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200 rounded-lg p-4">
              <div className="text-center flex-1 font-semibold text-base text-zinc-950">
                <div>{viewingMatch.teamA.logo}</div>
                <div className="mt-1">{viewingMatch.teamA.name}</div>
              </div>
              <div className="text-zinc-400 font-semibold px-2 text-xs">VS</div>
              <div className="text-center flex-1 font-semibold text-base text-zinc-950">
                <div>{viewingMatch.teamB.logo}</div>
                <div className="mt-1">{viewingMatch.teamB.name}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-zinc-150 pt-3">
              <div>
                <span className="text-xs font-semibold text-zinc-550 uppercase">Venue</span>
                <p className="font-semibold text-zinc-800">{viewingMatch.venue || "TBD"}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-550 uppercase">Date</span>
                <p className="font-semibold text-zinc-800">
                  {viewingMatch.dateTime ? new Date(viewingMatch.dateTime).toLocaleString() : "Not scheduled"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-550 uppercase">Status</span>
                <div>
                  <Badge status={viewingMatch.status} />
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-550 uppercase">Overs Limit</span>
                <p className="font-semibold font-mono text-zinc-800">{viewingMatch.overs} Overs</p>
              </div>
              <div className="col-span-2 border-t border-zinc-150 pt-3">
                <span className="text-xs font-semibold text-zinc-550 uppercase">Toss Setup</span>
                <p className="font-semibold text-zinc-700">
                  {viewingMatch.tossWinner.name} won toss and elected to {viewingMatch.tossDecision} first.
                </p>
              </div>
              {viewingMatch.status !== "Upcoming" && (
                <div className="col-span-2 border-t border-zinc-150 pt-3">
                  <span className="text-xs font-semibold text-zinc-550 uppercase">Scorecard summary</span>
                  <div className="mt-1 flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-md p-3.5 font-mono text-base font-bold text-zinc-900">
                    <span>
                      {viewingMatch.battingTeam.name}{viewingMatch.innings}
                    </span>
                    <span>
                      {viewingMatch.score}/{viewingMatch.wickets} ({Math.floor(viewingMatch.legalBalls / 6)}.{viewingMatch.legalBalls % 6} ov)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationModal}
        onClose={() => setIsConfirmationModal(false)}
        onConfirm={deletingMatch}
        title="Delete Match"
        message="Are you sure you want to delete this match record? All score records and commentary logs will be removed."
      />
    </div>
  );
}
