/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                                                                  ║
 * ║   ░█▀▀░█▀█░█▀▄░█▀▀░█░█   ░█▀▄░█▀▀░█░█░█▀▀                     ║
 * ║   ░█░░░█░█░█░█░█▀▀░▄▀▄   ░█░█░█▀▀░▀▄▀░▀▀█                     ║
 * ║   ░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀░▀   ░▀▀░░▀▀▀░░▀░░▀▀▀                     ║
 * ║                                                                  ║
 * ║           © 2026 CodeX Devs — All Rights Reserved               ║
 * ║                                                                  ║
 * ║   discord  ──  https://discord.gg/codexdev                      ║
 * ║   youtube  ──  https://youtube.com/@CodeXDevs                   ║
 * ║   github   ──  https://github.com/RayExo                        ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React from "react";
import { UserMinus } from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

const LeaveForm = dynamic(() => import("@/components/dashboard/leave-form").then(mod => mod.LeaveForm), {
  loading: () => <div className="h-96 w-full animate-pulse bg-slate-800/20 rounded-3xl" />
});

export default async function LeavePage({ params }: { params: { guildId: string } }) {
  const [leaveData, channelsData, guildDetails] = await Promise.all([
    api.getLeave(params.guildId),
    api.getChannels(params.guildId),
    api.getGuildDetails(params.guildId).catch(() => null)
  ]);

  if (!leaveData) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserMinus className="h-6 w-6 text-primary" />
            Leave Log
          </h2>
          <p className="text-slate-400 mt-1">Log members leaving your server with gorgeous Discord embeds.</p>
        </div>
      </div>

      <LeaveForm 
        initialConfig={leaveData} 
        channels={channelsData} 
        guildId={params.guildId} 
        serverName={guildDetails?.name || "Vada SMP"} 
      />
    </div>
  );
}
