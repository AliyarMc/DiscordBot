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

"use client";

import React, { useState, useEffect } from "react";
import { Search, Save, RefreshCcw, Bell } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function TrackingPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({
    channel_id: null,
    join_message: "",
    vanity_message: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configData, channelsData] = await Promise.all([
        api.getTracking(params.guildId),
        api.getChannels(params.guildId),
      ]);
      setConfig({
        channel_id: configData.channel_id,
        join_message: configData.join_message || "",
        vanity_message: configData.vanity_message || "",
      });
      setChannels(channelsData);
    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
      toast.error("Failed to load tracking configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.guildId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateTracking(params.guildId, config);
      toast.success("Tracking configuration saved successfully");
    } catch (error) {
      console.error("Failed to save tracking config:", error);
      toast.error("Failed to save tracking configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Invite Tracking</h2>
        <p className="text-muted-foreground">
          Configure where the bot logs invite information when a member joins.
        </p>
      </div>

      <Card className="border-primary/20 bg-background/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <CardTitle>Logging Configuration</CardTitle>
          </div>
          <CardDescription>
            Choose a channel to receive notifications about member invites and join sources.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Log Channel</Label>
            <Select
              value={config.channel_id || "none"}
              onValueChange={(val) => setConfig({ ...config, channel_id: val === "none" ? null : val })}
              options={[
                { value: "none", label: "Disabled" },
                ...channels.map((chan) => ({ value: chan.id.toString(), label: `#${chan.name}` }))
              ]}
            />
          </div>

          <div className="space-y-4 border-t border-slate-800/60 pt-6 mt-4">
            <h3 className="text-sm font-semibold text-white">Custom Invite Logs</h3>
            
            <div className="space-y-2">
              <Label>Join Message (With Inviter)</Label>
              <input 
                type="text" 
                placeholder="🎉 {user_mention} joined using an invite from {inviter_mention}!"
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={config.join_message || ""}
                onChange={(e) => setConfig({ ...config, join_message: e.target.value })}
              />
              <p className="text-[10px] text-slate-500">
                Variables: <code>{`{user_mention}`}</code>, <code>{`{user_name}`}</code>, <code>{`{inviter_mention}`}</code>, <code>{`{inviter_name}`}</code>, <code>{`{invites_count}`}</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Unknown/Vanity Invite Message</Label>
              <input 
                type="text" 
                placeholder="🎉 {user_mention} joined using an unknown/vanity invite!"
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={config.vanity_message || ""}
                onChange={(e) => setConfig({ ...config, vanity_message: e.target.value })}
              />
              <p className="text-[10px] text-slate-500">
                Variables: <code>{`{user_mention}`}</code>, <code>{`{user_name}`}</code>
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            <CardTitle className="text-yellow-500">Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The invite tracking module monitors all join events and attempts to identify which invite link was used.
            This information is then logged to your chosen channel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
