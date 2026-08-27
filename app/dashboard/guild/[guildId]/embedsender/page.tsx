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
  Edit, 
  ExternalLink, 
  Layers,
  Link2,
  AlertTriangle,
  Play,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface LinkButton {
  label: string;
  url: string;
  emoji?: string;
}

export default function EmbedSenderPage({ params }: { params: { guildId: string } }) {
  const [activeTab, setActiveTab] = useState<"designer" | "templates">("designer");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [savedMessages, setSavedMessages] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // For Delete Confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteFromDiscord, setDeleteFromDiscord] = useState(false);

  const initialFormState = {
    name: "",
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
      const [channelsData, messagesData] = await Promise.all([
        api.getChannels(params.guildId),
        api.listSavedMessages(params.guildId)
      ]);
      
      setChannels(channelsData);
      setSavedMessages(messagesData);
      
      if (channelsData.length > 0 && !form.channel_id) {
        setForm((prev: any) => ({ ...prev, channel_id: channelsData[0].id.toString() }));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load channel list or saved templates");
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

  // Button management
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

  // One-off Send Flow
  const handleSendOneOff = async () => {
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
      fetchData();
    } catch (error: any) {
      console.error("Failed to send embed:", error);
      toast.error(error.message || "Failed to dispatch embed message");
    } finally {
      setSending(false);
    }
  };

  // Save / Update Template (Optional send)
  const handleSaveTemplate = async (sendNow: boolean) => {
    if (!form.name || !form.name.trim()) {
      toast.error("Please enter a template name to save this configuration");
      return;
    }
    if (!form.channel_id) {
      toast.error("Please select a target channel");
      return;
    }
    if (sendNow && !form.message && !form.title && !form.description) {
      toast.error("Cannot dispatch an empty message to Discord. Add content or embed properties.");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        // Update existing template
        await api.updateSavedMessage(params.guildId, editingId, form, sendNow);
        toast.success(sendNow ? "Template saved and live Discord message edited!" : "Template successfully updated!");
      } else {
        // Create new template
        await api.createSavedMessage(params.guildId, form, sendNow);
        toast.success(sendNow ? "Template created and posted to Discord!" : "Template successfully saved!");
      }
      
      // Reset form & reload
      setEditingId(null);
      setForm({
        ...initialFormState,
        channel_id: channels.length > 0 ? channels[0].id.toString() : ""
      });
      fetchData();
      setActiveTab("templates");
    } catch (error: any) {
      console.error("Failed to save template:", error);
      toast.error(error.message || "Failed to save template configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (msg: any) => {
    setEditingId(msg.id);
    setForm({
      name: msg.name || "",
      channel_id: msg.channel_id || "",
      message: msg.message || "",
      title: msg.title || "",
      description: msg.description || "",
      color: msg.color || "#FF6B00",
      image_url: msg.image_url || "",
      thumbnail_url: msg.thumbnail_url || "",
      author_name: msg.author_name || "",
      author_icon: msg.author_icon || "",
      footer_text: msg.footer_text || "",
      footer_icon: msg.footer_icon || "",
      timestamp_enabled: !!msg.timestamp_enabled,
      buttons: msg.buttons || []
    });
    setActiveTab("designer");
    toast.info(`Loaded template "${msg.name}" for editing`);
  };

  const handleResend = async (msgId: string) => {
    try {
      toast.info("Sending template to Discord...");
      const res = await api.sendSavedMessage(params.guildId, msgId);
      toast.success("Template sent to Discord as a new message!");
      fetchData();
    } catch (error: any) {
      console.error("Failed to resend template:", error);
      toast.error(error.message || "Failed to send template");
    }
  };

  const handleDelete = async (msgId: string) => {
    try {
      setSaving(true);
      await api.deleteSavedMessage(params.guildId, msgId, deleteFromDiscord);
      toast.success(deleteFromDiscord ? "Template deleted and Discord message removed!" : "Template deleted successfully!");
      setConfirmDeleteId(null);
      setDeleteFromDiscord(false);
      fetchData();
    } catch (error: any) {
      console.error("Failed to delete template:", error);
      toast.error(error.message || "Failed to delete template");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Embed & Message Sender</h2>
          <p className="text-slate-400 mt-1">
            Design rich embeds and text announcements with custom link buttons, and manage them from your message dashboard.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              setActiveTab("designer");
              setEditingId(null);
              setForm({
                ...initialFormState,
                channel_id: channels.length > 0 ? channels[0].id.toString() : ""
              });
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === "designer" 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <Palette className="w-4 h-4" />
            Message Designer
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === "templates" 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <Layers className="w-4 h-4" />
            Templates Dashboard
            {savedMessages.length > 0 && (
              <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-md ml-1 font-black">
                {savedMessages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "designer" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Editor Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-primary/20 bg-[#141B2D]/50 backdrop-blur-xl rounded-3xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <CardTitle>{editingId ? "Edit Message Template" : "Destination & Naming"}</CardTitle>
                </div>
                <CardDescription>Configure where this message will post and name your template for the dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name (Dashboard-only)</Label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mojo Launcher Download"
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Text Channel</Label>
                    <Select 
                      value={form.channel_id}
                      onValueChange={(val) => updateField("channel_id", val)}
                      options={channelOptions}
                      placeholder="Select a channel..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Outer Text Message Content (E.g. @everyone or ping tags)</Label>
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
            <div className="flex flex-wrap gap-4 items-center justify-end">
              {editingId ? (
                <>
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setForm(initialFormState);
                      toast.info("Cleared editing mode");
                    }}
                    variant="ghost"
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel Edit
                  </Button>

                  <Button
                    onClick={() => handleSaveTemplate(false)}
                    disabled={saving}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold h-12 px-6 rounded-xl transition-all"
                  >
                    {saving ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Layers className="w-4 h-4 mr-2" />}
                    Update Template Only
                  </Button>

                  <Button
                    onClick={() => handleSaveTemplate(true)}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/80 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all"
                  >
                    {saving ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Save & Update Discord Message
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSendOneOff}
                    disabled={sending}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold h-12 px-6 rounded-xl transition-all"
                  >
                    {sending ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Broadcast One-Off Message
                  </Button>

                  <Button
                    onClick={() => handleSaveTemplate(false)}
                    disabled={saving}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 font-bold h-12 px-6 rounded-xl transition-all"
                  >
                    {saving ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Layers className="w-4 h-4 mr-2" />}
                    Save Template
                  </Button>

                  <Button
                    onClick={() => handleSaveTemplate(true)}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/80 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all"
                  >
                    {saving ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Send & Save Template
                  </Button>
                </>
              )}
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
      ) : (
        /* Saved Templates & Sent Messages Dashboard */
        <div className="space-y-6">
          {savedMessages.length === 0 ? (
            <div className="bg-[#141B2D]/40 border border-slate-800/80 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-4">
              <Layers className="w-16 h-16 text-slate-700 mx-auto" />
              <h3 className="text-xl font-bold text-white">No Message Templates Found</h3>
              <p className="text-slate-400 text-sm">
                You haven't saved any templates yet. Head over to the Message Designer tab to create, send, and save your first template!
              </p>
              <Button 
                onClick={() => setActiveTab("designer")} 
                className="bg-primary hover:bg-primary/80 text-white font-bold h-10 px-6 rounded-xl"
              >
                Go to Designer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {savedMessages.map((msg: any) => {
                const chan = channels.find((c) => c.id.toString() === msg.channel_id.toString());
                const isActiveOnDiscord = !!msg.message_id;

                return (
                  <Card 
                    key={msg.id}
                    className="border-slate-800 bg-[#141B2D]/30 hover:border-primary/20 hover:bg-[#141B2D]/50 transition-all rounded-3xl overflow-hidden group shadow-lg"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-base font-bold text-white group-hover:text-primary transition-colors">
                            {msg.name || "Unnamed Message"}
                          </CardTitle>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Created: {new Date(msg.created_at).toLocaleDateString()} at {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div 
                          className={cn(
                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1",
                            isActiveOnDiscord 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", isActiveOnDiscord ? "bg-emerald-400 animate-pulse" : "bg-slate-400")} />
                          {isActiveOnDiscord ? "Active in Discord" : "Template Draft"}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Destination */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800/40">
                        <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Channel:</span>
                        <span className="font-medium text-slate-200">
                          {chan ? `#${chan.name}` : `#${msg.channel_id}`}
                        </span>
                      </div>

                      {/* Content Preview */}
                      {(msg.title || msg.description || msg.message) && (
                        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-900 text-[11px] text-slate-400 space-y-1 max-h-24 overflow-y-auto no-scrollbar">
                          {msg.message && <p className="italic text-slate-500">"{msg.message}"</p>}
                          {msg.title && <p className="font-bold text-slate-200">{msg.title}</p>}
                          {msg.description && <p className="line-clamp-2">{msg.description}</p>}
                        </div>
                      )}

                      {/* Buttons list count */}
                      {msg.buttons && msg.buttons.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {msg.buttons.map((btn: LinkButton, i: number) => (
                            <span 
                              key={i} 
                              className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1"
                            >
                              {btn.emoji && <span>{btn.emoji}</span>}
                              {btn.label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Inline Delete Confirmation */}
                      {confirmDeleteId === msg.id ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                          <div className="flex gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-red-300">
                              <span className="font-bold">Are you sure?</span> This will delete the saved template.
                            </div>
                          </div>

                          {isActiveOnDiscord && (
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={deleteFromDiscord} 
                                onChange={(e) => setDeleteFromDiscord(e.target.checked)} 
                                className="rounded border-slate-800 bg-[#0f172a] text-red-500 focus:ring-red-500 h-3.5 w-3.5"
                              />
                              <span className="text-[10px] text-slate-400 hover:text-white">
                                Also delete the message from the Discord channel
                              </span>
                            </label>
                          )}

                          <div className="flex justify-end gap-2">
                            <Button 
                              onClick={() => {
                                setConfirmDeleteId(null);
                                setDeleteFromDiscord(false);
                              }}
                              className="h-8 px-3 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => handleDelete(msg.id)}
                              className="h-8 px-3 text-xs bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl"
                            >
                              Yes, Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Normal Actions Footer */
                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/40 gap-2">
                          <Button 
                            onClick={() => setConfirmDeleteId(msg.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 h-9 w-9 p-0 rounded-xl border border-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleEdit(msg)}
                              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 h-9 px-4 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit Config
                            </Button>

                            <Button 
                              onClick={() => handleResend(msg.id)}
                              className="bg-primary hover:bg-primary/80 text-white h-9 px-4 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-lg shadow-primary/15"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {isActiveOnDiscord ? "Send Copy" : "Publish Message"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
