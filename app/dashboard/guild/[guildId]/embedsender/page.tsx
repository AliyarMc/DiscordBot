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
import { 
  MessageSquare, 
  Send, 
  RefreshCcw, 
  Palette, 
  Image as ImageIcon, 
  Settings, 
  Info, 
  Calendar, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Link2
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";

interface LinkButton {
  label: string;
  url: string;
  emoji?: string;
}

export default function EmbedSenderPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  
  const initialFormState = {
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
    timestamp_enabled: false,
    buttons: [] as LinkButton[]
  };

  const [form, setForm] = useState<any>(initialFormState);

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

  const updateField = (field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Button list management
  const handleAddButton = () => {
    if (form.buttons.length >= 5) {
      toast.warning("You can attach a maximum of 5 link buttons per message.");
      return;
    }
    setForm((prev: any) => ({
      ...prev,
      buttons: [...prev.buttons, { label: "", url: "", emoji: "" }]
    }));
  };

  const handleRemoveButton = (idx: number) => {
    setForm((prev: any) => ({
      ...prev,
      buttons: prev.buttons.filter((_: any, i: number) => i !== idx)
    }));
  };

  const handleUpdateButton = (idx: number, field: keyof LinkButton, val: string) => {
    setForm((prev: any) => {
      const copy = [...prev.buttons];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, buttons: copy };
    });
  };

  const handleSend = async () => {
    if (!form.channel_id) {
      toast.error("Please select a target channel");
      return;
    }
    if (!form.message && !form.title && !form.description) {
      toast.error("You must enter either an outer text message, an embed title, or an embed description");
      return;
    }

    try {
      setSending(true);
      await api.sendEmbed(params.guildId, form);
      toast.success("Message successfully broadcasted to Discord!");
    } catch (error: any) {
      console.error("Failed to send embed:", error);
      toast.error(error.message || "Failed to dispatch message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter text channels
  const textChannels = channels.filter(
    (c) => c.type === 0 || c.type === "0" || c.type === 5 || c.type === "5" || c.type === 15 || c.type === "15"
  );
  
  const channelOptions = (textChannels.length > 0 ? textChannels : channels).map((c) => ({
    value: c.id.toString(),
    label: `#${c.name}`
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Embed & Message Sender</h2>
        <p className="text-slate-400 mt-1">
          Design rich embeds or text announcements with custom link buttons, and broadcast them directly to server channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-primary/20 bg-[#141B2D]/50 backdrop-blur-xl rounded-3xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <CardTitle>Destination & Text Content</CardTitle>
              </div>
              <CardDescription>Configure where this message will post and outer alert content.</CardDescription>
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
                <Label>Outer Content Message (E.g. @everyone or ping tags)</Label>
                <input 
                  type="text" 
                  placeholder="Check out our new update!"
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-[#141B2D]/50 backdrop-blur-xl rounded-3xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <CardTitle>Embed Designer</CardTitle>
              </div>
              <CardDescription>Leave all embed fields blank if you just want to send a normal message.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Embed Title</Label>
                  <input 
                    type="text" 
                    placeholder="🎉 Mojo Launcher Download"
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
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
                  placeholder="Play Minecraft Java Edition on Android with support for multiple versions..."
                  className="min-h-[160px] bg-[#0f172a] border border-slate-800 text-sm font-sans"
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
                    placeholder="Rebirth Links"
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
                  <Label>Small Thumbnail URL</Label>
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
                    placeholder="Only download from official sources."
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
            </CardContent>
          </Card>

          {/* Link Buttons Configurator */}
          <Card className="border-primary/20 bg-[#141B2D]/50 backdrop-blur-xl rounded-3xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                <CardTitle>Link Buttons Component</CardTitle>
              </div>
              <CardDescription>Attach up to 5 Discord action row link buttons at the bottom of your message.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.buttons.map((btn: LinkButton, idx: number) => (
                <div 
                  key={idx} 
                  className="flex flex-col md:flex-row gap-3 items-end bg-slate-900/40 p-4 rounded-2xl border border-slate-800 animate-in zoom-in-95 duration-150"
                >
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-slate-400">Button Label</Label>
                    <input
                      type="text"
                      placeholder="e.g. Download"
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      value={btn.label}
                      onChange={(e) => handleUpdateButton(idx, "label", e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-slate-400">Link URL</Label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      value={btn.url}
                      onChange={(e) => handleUpdateButton(idx, "url", e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs text-slate-400">Emoji (Optional)</Label>
                    <input
                      type="text"
                      placeholder="e.g. 🔗"
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      value={btn.emoji || ""}
                      onChange={(e) => handleUpdateButton(idx, "emoji", e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleRemoveButton(idx)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 h-9 px-3 rounded-xl border border-red-500/20 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {form.buttons.length < 5 && (
                <Button
                  type="button"
                  onClick={handleAddButton}
                  className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Link Button ({form.buttons.length}/5)
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Action Submits */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSend}
              disabled={sending}
              className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 justify-center"
            >
              {sending ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Broadcast Embed Message
            </Button>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
          <div className="bg-[#0b0e14] border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl p-6 relative animate-in fade-in duration-300">
            <div className="absolute top-4 right-4 text-[9px] uppercase font-black text-slate-500 tracking-wider">
              Live Preview
            </div>

            <div className="flex gap-3 pt-6">
              <div className="w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center text-xs font-black text-primary border border-primary/10 flex-shrink-0">
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
                    {/* Author */}
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

                    {/* Content */}
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

                    {/* Image */}
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

                    {/* Footer */}
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

                {/* Buttons rendering matching standard Discord link buttons */}
                {form.buttons && form.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3.5">
                    {form.buttons.map((btn: LinkButton, idx: number) => {
                      if (!btn.label && !btn.emoji) return null;
                      return (
                        <div 
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#4e5058] hover:bg-[#6d6f78] text-[#dbdee1] text-xs font-semibold select-none cursor-pointer transition-colors duration-150 shadow-sm"
                        >
                          {btn.emoji && <span className="text-[14px]">{btn.emoji}</span>}
                          <span>{btn.label || "Link Button"}</span>
                          <span className="text-slate-400 font-black text-[10px]">↗</span>
                        </div>
                      );
                    })}
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
