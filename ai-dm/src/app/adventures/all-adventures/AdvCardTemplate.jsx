import { ADVENTURES } from "@/app/utils/variables/database-vars";
import React from "react";
import Link from "next/link";
import { addPlayerToAdventure } from "@/app/firebase/firebase-db-adventures";
import { useUser } from "@/app/contexts/UserContext";
import { useAdventure } from "@/app/contexts/AdventureContext";

export const cardDesign =
    "bg-slate-900 border border-transparent border-2 hover:border-yellow-500 hover:border-2 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 max-w-sm mx-2 my-2";

export function createAdventureCard(adventure) {
    // ****** STATES AND VARIABLES ****** ------------------------->

    const { currentUser } = useUser();
    const { setSelectedAdventure, selectedAdventure } = useAdventure();


    const handleJoinAdventure = async () => {
        try {
            await setSelectedAdventure(adventure);
            await addPlayerToAdventure(adventure.id, currentUser.username);
            console.log(
                `${currentUser?.username} Has Joined Joining: ${adventure?.name} adventure`
            );
            console.log(`adventure: ${adventure}`);
            console.log(setSelectedAdventure);
        } catch (error) {
            console.error(error);
        }
    };



    return (
        <Link
            href={`/adventures/${adventure.id}`}
            key={adventure.id}
            className={cardDesign}
        >
            <div className="overflow-hidden transform transition-transform duration-300 hover:scale-110">
                <img
                    src={adventure.profileImg}
                    alt="Adventure Image"
                    className="z-1 w-full h-48 object-cover"
                />
            </div>
            <div className="relative bg-slate-800 text-yellow-600 text-center py-2 font-semibold">
                {adventure.name}
            </div>
            <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 text-slate-300">
                    {adventure.type}
                </h3>
                <p className="text-slate-400 mb-4">{adventure.description}</p>
                <div className="">
                    <button className="shadow-lg bg-slate-700  hover:bg-yellow-500 hover:text-slate-700 text-slate-300 font-semibold p-2 mr-1 rounded-full">
                        Check it out
                    </button>
                    <button className=" shadow-lg bg-slate-700 hover:bg-yellow-500 hover:text-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-full">
                        Add to favorite
                    </button>
                    <button
                        value={adventure.id}
                        onClick={() => {
                            (e)=>setSelectedAdventure({id: e.target.value});
                            handleJoinAdventure();
                        }}
                        className=" shadow-lg bg-green-900 hover:bg-green-500 hover:text-slate-700 text-slate-300 font-semibold py-2 px-4 ml-1 rounded-full"
                    >
                        Join
                    </button>
                </div>
            </div>
        </Link>
    );
}
