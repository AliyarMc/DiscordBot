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
import { MessageSquare, Send, RefreshCcw, Palette, Image as ImageIcon, Settings, Info, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";

export default function EmbedSenderPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    channel_id: "",
    message: "",
    title: "",
    description: "",
    color: "#FF6B00",
    image_url: "",
    thumbnail_url: "",
    author_name: "",
    author_icon: "",
    footer_text: "",
    footer_icon: "",
    timestamp_enabled: false
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const channelsData = await api.getChannels(params.guildId);
      setChannels(channelsData);
      if (channelsData.length > 0) {
        setForm((prev: any) => ({ ...prev, channel_id: channelsData[0].id.toString() }));
      }
    } catch (error) {
      console.error("Failed to fetch channels:", error);
      toast.error("Failed to load channel list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.guildId]);

  const handleSend = async () => {
    if (!form.channel_id) {
      toast.error("Please select a target channel");
      return;
    }
    if (!form.message && !form.title && !form.description) {
      toast.error("You must enter either a text message, an embed title, or an embed description");
      return;
    }

    try {
      setSending(true);
      await api.sendEmbed(params.guildId, form);
      toast.success("Embed message successfully sent to Discord!");
    } catch (error: any) {
      console.error("Failed to send embed:", error);
      toast.error(error.message || "Failed to dispatch embed message");
    } finally {
      setSending(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const channelOptions = channels.map((c) => ({
    value: c.id.toString(),
    label: `#${c.name}`
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Embed Sender</h2>
        <p className="text-slate-400">
          Construct and broadcast rich Discord embeds or system announcements directly to any server channel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-primary/20 bg-background/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <CardTitle>Destination & Text Message</CardTitle>
              </div>
              <CardDescription>Select where to post and optional ping text tags.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Text Channel</Label>
                <Select 
                  value={form.channel_id}
                  onValueChange={(val) => updateField("channel_id", val)}
                  options={channelOptions}
                  placeholder="Select a channel..."
                />
              </div>

              <div className="space-y-2">
                <Label>Outer Content Message (E.g. @everyone or @here)</Label>
                <input 
                  type="text" 
                  placeholder="@everyone"
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-background/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <CardTitle>Embed Designer</CardTitle>
              </div>
              <CardDescription>Format title, body descriptions, colors, and thumbnails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Embed Title</Label>
                  <input 
                    type="text" 
                    placeholder="🎉 SERVER RULES & INFORMATION"
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Left Side Strip Color</Label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={form.color}
                      onChange={(e) => updateField("color", e.target.value)}
                      className="bg-transparent border-0 w-8 h-8 rounded cursor-pointer p-0"
                    />
                    <input 
                      type="text" 
                      placeholder="#FF6B00"
                      className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      value={form.color}
                      onChange={(e) => updateField("color", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Embed Description (Supports Markdown / Emojis)</Label>
                  <span className="text-[10px] text-slate-500">Supports standard discord formatting</span>
                </div>
                <Textarea
                  placeholder="Welcome to our community! Please write the description details here..."
                  className="min-h-[220px] bg-[#0f172a] border border-slate-800 text-sm font-sans"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              {/* Author Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Author Name</Label>
                  <input 
                    type="text" 
                    placeholder="Server Announcements"
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    value={form.author_name}
                    onChange={(e) => updateField("author_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author Icon URL</Label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="https://example.com/icon.png"
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-3 pr-24 py-2 text-sm text-white focus:outline-none"
                      value={form.author_icon}
                      onChange={(e) => updateField("author_icon", e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => updateField("author_icon", "{server_icon}")}
                      className="absolute right-1.5 top-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded text-[10px] font-black uppercase transition-colors"
                    >
                      Server Icon
                    </button>
                  </div>
                </div>
              </div>

              {/* Images Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Large Bottom Image URL</Label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/banner.png"
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    value={form.image_url}
                    onChange={(e) => updateField("image_url", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Small Thumbnail URL (Server Avatar)</Label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="https://example.com/thumbnail.png"
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-3 pr-24 py-2 text-sm text-white focus:outline-none"
                      value={form.thumbnail_url}
                      onChange={(e) => updateField("thumbnail_url", e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => updateField("thumbnail_url", "{server_icon}")}
                      className="absolute right-1.5 top-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded text-[10px] font-black uppercase transition-colors"
                    >
                      Server Icon
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <input 
                    type="text" 
                    placeholder="Server Team • Broadcast System"
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    value={form.footer_text}
                    onChange={(e) => updateField("footer_text", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Footer Icon URL</Label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/footer_icon.png"
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    value={form.footer_icon}
                    onChange={(e) => updateField("footer_icon", e.target.value)}
                  />
                </div>
              </div>

              {/* Timestamp Toggle */}
              <div className="flex items-center justify-between bg-slate-900/30 border border-slate-800/60 p-4 rounded-2xl">
                <div>
                  <span className="text-sm font-bold text-white">Append Embed Timestamp</span>
                  <p className="text-xs text-slate-500 mt-1">Show current date and time in the bottom right of the embed.</p>
                </div>
                <Switch 
                  checked={form.timestamp_enabled}
                  onCheckedChange={(val) => updateField("timestamp_enabled", val)}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSend} 
                  disabled={sending} 
                  className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/80 text-white font-bold h-12 px-6 rounded-xl"
                >
                  {sending ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Broadcast Embed Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Client Preview */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
          <div className="bg-[#0b0e14] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <div className="absolute top-4 right-4 text-[9px] uppercase font-black text-slate-500 tracking-wider">
              Live Embed Preview
            </div>

            <div className="flex gap-3 pt-6">
              <div className="w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center text-xs font-black text-primary border border-primary/10">
                BOT
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-white hover:underline cursor-pointer">Bot Assistant</span>
                  <span className="bg-primary/95 text-white text-[8px] font-black uppercase px-1 rounded-sm tracking-wider">App</span>
                  <span className="text-[10px] text-slate-500 ml-1">Today at 12:00 PM</span>
                </div>

                {form.message && (
                  <div className="text-xs text-slate-200 leading-relaxed mb-2 whitespace-pre-line font-medium">
                    {form.message}
                  </div>
                )}

                {(form.title || form.description || form.image_url || form.thumbnail_url || form.footer_text || form.author_name) && (
                  <div 
                    className="border-l-4 rounded-r-md bg-[#181d27]/70 p-4 space-y-3 mt-1.5"
                    style={{ borderColor: form.color || "#FF6B00" }}
                  >
                    {/* Author rendering */}
                    {form.author_name && (
                      <div className="flex items-center gap-2">
                        {form.author_icon && (
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-900 border border-slate-800">
                            <img src={form.author_icon === "{server_icon}" ? "https://cdn.discordapp.com/embed/avatars/0.png" : form.author_icon} className="w-full h-full object-cover" alt="" />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-white leading-none">
                          {form.author_name}
                        </span>
                      </div>
                    )}

                    {/* Title & Description rendering */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {form.title && (
                          <div className="text-sm font-bold text-white leading-snug">
                            {form.title}
                          </div>
                        )}
                        {form.description && (
                          <div className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line">
                            {form.description}
                          </div>
                        )}
                      </div>

                      {form.thumbnail_url && (
                        <div className="w-16 h-16 rounded overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0">
                          <img 
                            src={form.thumbnail_url === "{server_icon}" ? "https://cdn.discordapp.com/embed/avatars/0.png" : form.thumbnail_url} 
                            className="w-full h-full object-cover" 
                            alt=""
                          />
                        </div>
                      )}
                    </div>

                    {/* Large Image rendering */}
                    {form.image_url && (
                      <div className="rounded-lg overflow-hidden border border-slate-800/50 max-h-48 bg-slate-950">
                        <img 
                          src={form.image_url} 
                          className="w-full h-full object-cover" 
                          alt="" 
                          onError={(e: any) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}

                    {/* Footer rendering */}
                    {(form.footer_text || form.timestamp_enabled) && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/30 text-[9px] text-slate-500 font-medium">
                        {form.footer_icon && (
                          <img src={form.footer_icon} className="w-3.5 h-3.5 rounded-full object-cover" alt="" />
                        )}
                        <span>{form.footer_text || "Broadcaster"}</span>
                        {form.timestamp_enabled && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              Today at 12:00 PM
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
