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

import React, { useState } from "react";
import { 
  Save,
  MessageSquare,
  Type,
  LayoutTemplate,
  RefreshCcw,
  Sparkles,
  Palette,
  Settings,
  Layers,
  Eye,
  Sliders,
  Brush
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { WelcomeConfig, DiscordChannel, WelcomeImageConfig } from "@/types/api";
import { WelcomePreviewCanvas } from "./welcome-preview-canvas";

interface WelcomeFormProps {
  initialConfig: WelcomeConfig;
  channels: DiscordChannel[];
  guildId: string;
  serverName?: string;
}

const defaultImageConfig: WelcomeImageConfig = {
  enabled: false,
  canvas: {
    width: 1020,
    height: 450,
    background_type: "gradient",
    background_color: "#080808",
    gradient_color1: "#080808",
    gradient_color2: "#140B17",
    background_image_url: "",
    overlay_opacity: 0.4,
    border_thickness: 8,
    border_color: "#FF6B00"
  },
  avatar: {
    x: 510,
    y: 180,
    size: 180,
    shape: "rounded",
    border_thickness: 8,
    border_color: "#FF6B00"
  },
  texts: {
    text1: {
      content: "WELCOME TO [accent:{server_name}]",
      x: 510,
      y: 60,
      color: "#ffffff",
      font_size: 40
    },
    text2: {
      content: "{user_name}. Has joined the Community!",
      x: 510,
      y: 320,
      color: "#ffffff",
      font_size: 36
    },
    text3: {
      content: "Member #{server_membercount}",
      x: 510,
      y: 370,
      color: "#FF6B00",
      font_size: 24
    },
    text4: {
      content: "{server_name}",
      x: 510,
      y: 405,
      color: "#ffffff",
      font_size: 18
    },
    text5: {
      content: "{server_name} • Community",
      x: 510,
      y: 430,
      color: "#A3A3A3",
      font_size: 14
    }
  }
};

export function WelcomeForm({ initialConfig, channels, guildId, serverName = "Vada SMP" }: WelcomeFormProps) {
  const [config, setConfig] = useState<WelcomeConfig>(() => {
    return {
      ...initialConfig,
      image_config: initialConfig.image_config || defaultImageConfig
    };
  });
  const canvasWidth = config.image_config?.canvas?.width ?? 1020;
  const canvasHeight = config.image_config?.canvas?.height ?? 450;
  const [activeTab, setActiveTab] = useState<"message" | "card">("message");
  const [activeTextLayer, setActiveTextLayer] = useState<string>("text1");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const promise = api.updateWelcome(guildId, config);

    toast.promise(promise, {
      loading: 'Saving welcome configuration...',
      success: 'Welcome settings saved successfully!',
      error: 'Failed to update welcome settings',
    });

    try {
      await promise;
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const channelOptions = channels.map(c => ({
    value: c.id.toString(),
    label: `#${c.name}`
  }));

  const typeOptions = [
    { value: "simple", label: "Simple Text Message" },
    { value: "embed", label: "Rich Embed Message" }
  ];

  const bgTypeOptions = [
    { value: "gradient", label: "Gradient Fill" },
    { value: "solid", label: "Solid Color" },
    { value: "image", label: "Custom Background Image" }
  ];

  const avShapeOptions = [
    { value: "rounded", label: "Rounded (Circle)" },
    { value: "square", label: "Square" }
  ];

  const textLayerOptions = [
    { value: "text1", label: "Text Layer 1 (Header)" },
    { value: "text2", label: "Text Layer 2 (Join Msg)" },
    { value: "text3", label: "Text Layer 3 (Member Count)" },
    { value: "text4", label: "Text Layer 4 (Subtext)" },
    { value: "text5", label: "Text Layer 5 (Footer)" }
  ];

  // Helper State Handlers
  const updateImageConfig = (updater: (prev: WelcomeImageConfig) => WelcomeImageConfig) => {
    setConfig(prev => ({
      ...prev,
      image_config: updater(prev.image_config || defaultImageConfig)
    }));
  };

  const updateCanvas = (field: string, value: any) => {
    updateImageConfig(prev => ({
      ...prev,
      canvas: {
        ...(prev.canvas || defaultImageConfig.canvas!),
        [field]: value
      }
    }));
  };

  const updateAvatar = (field: string, value: any) => {
    updateImageConfig(prev => ({
      ...prev,
      avatar: {
        ...(prev.avatar || defaultImageConfig.avatar!),
        [field]: value
      }
    }));
  };

  const updateText = (layer: string, field: string, value: any) => {
    updateImageConfig(prev => {
      const currentTexts = prev.texts || defaultImageConfig.texts!;
      const targetText = currentTexts[layer as keyof typeof currentTexts] || { content: "", x: 510, y: 200, color: "#ffffff", font_size: 24 };
      return {
        ...prev,
        texts: {
          ...currentTexts,
          [layer]: {
            ...targetText,
            [field]: value
          }
        }
      };
    });
  };

  const currentTexts = config.image_config?.texts || defaultImageConfig.texts!;
  const currentTextLayer = currentTexts[activeTextLayer as keyof typeof currentTexts] || { content: "", x: 510, y: 200, color: "#ffffff", font_size: 24 };

  return (
    <div className="space-y-8">
      {/* Tabs Selector */}
      <div className="flex border-b border-slate-800/80 pb-px">
        <button
          onClick={() => setActiveTab("message")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all focus:outline-none ${
            activeTab === "message"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Message & Embed Config
        </button>
        <button
          onClick={() => setActiveTab("card")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all focus:outline-none ${
            activeTab === "card"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Brush className="w-4 h-4" />
          Welcome Card Designer
        </button>
      </div>

      {activeTab === "message" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#141B2D] border border-slate-800 rounded-3xl shadow-xl p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Response Type</label>
                  <Select 
                    value={config.welcome_type || "simple"}
                    onValueChange={(val) => setConfig({ ...config, welcome_type: val })}
                    options={typeOptions}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Welcome Channel</label>
                  <Select 
                    value={config.channel_id || ""}
                    onValueChange={(val) => setConfig({ ...config, channel_id: val })}
                    options={channelOptions}
                    placeholder="Select a channel..."
                    className="mt-2"
                  />
                </div>

                {config.welcome_type === "simple" && (
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Message Content</label>
                    <textarea 
                      value={config.welcome_message || ""}
                      onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                      placeholder="Welcome {user} to {server_name}!"
                      className="w-full mt-2 bg-[#0f172a] border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white min-h-[120px]"
                    />
                  </div>
                )}

                {config.welcome_type === "embed" && (
                  <div className="space-y-4 pt-4 border-t border-slate-800/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Embed Title</label>
                        <input 
                          type="text"
                          value={config.embed_data?.title || ""}
                          onChange={(e) => setConfig({ ...config, embed_data: { ...config.embed_data, title: e.target.value }})}
                          className="w-full mt-2 bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                          placeholder="Welcome to the server!"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Embed Color (Hex)</label>
                        <input 
                          type="text"
                          value={config.embed_data?.color || ""}
                          onChange={(e) => setConfig({ ...config, embed_data: { ...config.embed_data, color: e.target.value }})}
                          className="w-full mt-2 bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                          placeholder="#3498db"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Embed Description</label>
                      <textarea 
                        value={config.embed_data?.description || ""}
                        onChange={(e) => setConfig({ ...config, embed_data: { ...config.embed_data, description: e.target.value }})}
                        placeholder="We're glad to have you here, {user}!"
                        className="w-full mt-2 bg-[#0f172a] border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Thumbnail URL</label>
                        <input 
                          type="text"
                          value={config.embed_data?.thumbnail || ""}
                          onChange={(e) => setConfig({ ...config, embed_data: { ...config.embed_data, thumbnail: e.target.value }})}
                          className="w-full mt-2 bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                          placeholder="{user_avatar} or https://..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Image URL</label>
                        <input 
                          type="text"
                          value={config.embed_data?.image || ""}
                          onChange={(e) => setConfig({ ...config, embed_data: { ...config.embed_data, image: e.target.value }})}
                          className="w-full mt-2 bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSave}
                disabled={saving}
                className="w-full h-14 text-base font-bold gap-2"
              >
                {saving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Save Configuration
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#141B2D] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest mb-4">Variables</h3>
              <div className="space-y-2 text-xs text-slate-400 font-mono bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <p className="flex justify-between hover:text-white transition-colors"><span>{'{user}'}</span> <span>@Username</span></p>
                <p className="flex justify-between hover:text-white transition-colors"><span>{'{user_name}'}</span> <span>Username</span></p>
                <p className="flex justify-between hover:text-white transition-colors"><span>{'{server_name}'}</span> <span>Server Name</span></p>
                <p className="flex justify-between hover:text-white transition-colors"><span>{'{server_membercount}'}</span> <span>Total Members</span></p>
                <p className="border-t border-slate-800 my-2 pt-2 flex justify-between hover:text-white transition-colors"><span>{'{user_avatar}'}</span> <span>Avatar Image</span></p>
                <p className="flex justify-between hover:text-white transition-colors"><span>{'{server_icon}'}</span> <span>Server Logo</span></p>
              </div>
              <p className="text-[10px] text-slate-500 italic text-center mt-4">You can use these variables in both message content and embeds to personalize welcomes.</p>
            </div>
            
            <div className="bg-[#141B2D] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest mb-4">Auto Setup</h3>
              <Button onClick={() => setConfig({
                  ...config,
                  welcome_type: "embed",
                  embed_data: {
                    ...config.embed_data,
                    title: "Welcome to {server_name}!",
                    description: "Hi {user}, we're glad you joined! You are member #{server_membercount}.",
                    color: "2f3136",
                    thumbnail: "{user_avatar}"
                  }
                })} 
                variant="outline" 
                className="w-full border-primary/50 hover:bg-primary/20 text-primary"
              >
                <LayoutTemplate className="w-4 h-4 mr-2" />
                Apply Default Template
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Welcome Card Designer Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Live Preview Column */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
            <WelcomePreviewCanvas 
              imageConfig={config.image_config} 
              serverName={serverName}
            />
            
            <div className="bg-[#141B2D] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider">Welcome Card Status</h3>
                  <p className="text-xs text-slate-400 mt-1">Generate and attach this welcome card image on joins.</p>
                </div>
                <Switch 
                  checked={config.image_config?.enabled || false}
                  onCheckedChange={(val) => updateImageConfig(prev => ({ ...prev, enabled: val }))}
                />
              </div>

              <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
                <p>💡 <span className="font-bold text-slate-200">How it works:</span> If enabled, the bot will dynamically compile this image. If using <strong>Embed</strong> mode, it attaches the card as the main embed image. If using <strong>Simple</strong> mode, it sends it as a message attachment.</p>
              </div>

              <Button 
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 text-sm font-bold gap-2 mt-2"
              >
                {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Designer Config
              </Button>
            </div>
          </div>

          {/* Designer Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Canvas Dimensions & Border */}
            <div className="bg-[#141B2D] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Canvas & Border Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400">Canvas Width (px)</label>
                  <input 
                    type="number" 
                    value={config.image_config?.canvas?.width ?? 1020}
                    onChange={(e) => updateCanvas("width", parseInt(e.target.value) || 1020)}
                    className="w-full mt-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400">Canvas Height (px)</label>
                  <input 
                    type="number" 
                    value={config.image_config?.canvas?.height ?? 450}
                    onChange={(e) => updateCanvas("height", parseInt(e.target.value) || 450)}
                    className="w-full mt-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400">Canvas Border Thickness (px)</label>
                  <input 
                    type="number" 
                    value={config.image_config?.canvas?.border_thickness ?? 8}
                    onChange={(e) => updateCanvas("border_thickness", parseInt(e.target.value) || 0)}
                    className="w-full mt-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 flex justify-between">
                    <span>Canvas Border Color</span>
                    <span className="text-slate-500 font-mono">{config.image_config?.canvas?.border_color ?? "#9b5de5"}</span>
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="color" 
                      value={config.image_config?.canvas?.border_color ?? "#9b5de5"}
                      onChange={(e) => updateCanvas("border_color", e.target.value)}
                      className="bg-transparent border-0 w-8 h-8 rounded cursor-pointer p-0"
                    />
                    <input 
                      type="text" 
                      value={config.image_config?.canvas?.border_color ?? "#9b5de5"}
                      onChange={(e) => updateCanvas("border_color", e.target.value)}
                      className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Background Style */}
            <div className="bg-[#141B2D] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Background Customization
              </h3>
              
              <div>
                <label className="text-xs font-bold text-slate-400">Background Type</label>
                <Select
                  value={config.image_config?.canvas?.background_type || "gradient"}
                  onValueChange={(val) => updateCanvas("background_type", val)}
                  options={bgTypeOptions}
                  className="mt-1"
                />
              </div>

              {(config.image_config?.canvas?.background_type || "gradient") === "solid" && (
                <div>
                  <label className="text-xs font-bold text-slate-400 flex justify-between">
                    <span>Solid Color</span>
                    <span className="text-slate-500 font-mono">{config.image_config?.canvas?.background_color ?? "#0f081d"}</span>
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="color" 
                      value={config.image_config?.canvas?.background_color ?? "#0f081d"}
                      onChange={(e) => updateCanvas("background_color", e.target.value)}
                      className="bg-transparent border-0 w-8 h-8 rounded cursor-pointer p-0"
                    />
                    <input 
                      type="text" 
                      value={config.image_config?.canvas?.background_color ?? "#0f081d"}
                      onChange={(e) => updateCanvas("background_color", e.target.value)}
                      className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {(config.image_config?.canvas?.background_type || "gradient") === "gradient" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 flex justify-between">
                      <span>Gradient Start</span>
                      <span className="text-slate-500 font-mono">{config.image_config?.canvas?.gradient_color1 ?? "#0f081d"}</span>
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="color" 
                        value={config.image_config?.canvas?.gradient_color1 ?? "#0f081d"}
                        onChange={(e) => updateCanvas("gradient_color1", e.target.value)}
                        className="bg-transparent border-0 w-8 h-8 rounded cursor-pointer p-0"
                      />
                      <input 
                        type="text" 
                        value={config.image_config?.canvas?.gradient_color1 ?? "#0f081d"}
                        onChange={(e) => updateCanvas("gradient_color1", e.target.value)}
                        className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 flex justify-between">
                      <span>Gradient End</span>
                      <span className="text-slate-500 font-mono">{config.image_config?.canvas?.gradient_color2 ?? "#2b0a3d"}</span>
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="color" 
                        value={config.image_config?.canvas?.gradient_color2 ?? "#2b0a3d"}
                        onChange={(e) => updateCanvas("gradient_color2", e.target.value)}
                        className="bg-transparent border-0 w-8 h-8 rounded cursor-pointer p-0"
                      />
                      <input 
                        type="text" 
                        value={config.image_config?.canvas?.gradient_color2 ?? "#2b0a3d"}
                        onChange={(e) => updateCanvas("gradient_color2", e.target.value)}
                        className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(config.image_config?.canvas?.background_type || "gradient") === "image" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400">Background Image URL</label>
                    <input 
                      type="text" 
                      value={config.image_config?.canvas?.background_image_url ?? ""}
                      onChange={(e) => updateCanvas("background_image_url", e.target.value)}
                      placeholder="https://example.com/welcome-bg.png"
                      className="w-full mt-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 flex justify-between">
                      <span>Dark Overlay Opacity</span>
                      <span className="text-primary font-bold">{Math.round((config.image_config?.canvas?.overlay_opacity ?? 0.4) * 100)}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={config.image_config?.canvas?.overlay_opacity ?? 0.4}
                      onChange={(e) => updateCanvas("overlay_opacity", parseFloat(e.target.value))}
                      className="w-full mt-2 accent-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Avatar Config */}
            <div className="bg-[#141B2D] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                Avatar Position & Style
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 flex justify-between">
                    <span>Position X (Horizontal Center)</span>
                    <span className="text-slate-500 font-mono">{config.image_config?.avatar?.x ?? 510}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max={canvasWidth}
                    value={config.image_config?.avatar?.x ?? 510}
                    onChange={(e) => updateAvatar("x", parseInt(e.target.value))}
                    className="w-full mt-2 accent-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 flex justify-between">
                    <span>Position Y (Vertical Center)</span>
                    <span className="text-slate-500 font-mono">{config.image_config?.avatar?.y ?? 180}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max={canvasHeight}
                    value={config.image_config?.avatar?.y ?? 180}
                    onChange={(e) => updateAvatar("y", parseInt(e.target.value))}
                    className="w-full mt-2 accent-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 flex justify-between">
                    <span>Avatar Diameter</span>
                    <span className="text-slate-500 font-mono">{config.image_config?.avatar?.size ?? 180}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="40" 
                    max="300"
                    value={config.image_config?.avatar?.size ?? 180}
                    onChange={(e) => updateAvatar("size", parseInt(e.target.value))}
                    className="w-full mt-2 accent-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400">Shape</label>
                  <Select
                    value={config.image_config?.avatar?.shape || "rounded"}
                    onValueChange={(val) => updateAvatar("shape", val)}
                    options={avShapeOptions}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 flex justify-between">
                    <span>Border Thickness</span>
                    <span className="text-slate-500 font-mono">{config.image_config?.avatar?.border_thickness ?? 8}px</span>
                  </label>
                  <input 
                    type="number" 
                    value={config.image_config?.avatar?.border_thickness ?? 8}
                    onChange={(e) => updateAvatar("border_thickness", parseInt(e.target.value) || 0)}
                    className="w-full mt-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 flex justify-between">
                    <span>Border Color</span>
                    <span className="text-slate-500 font-mono">{config.image_config?.avatar?.border_color ?? "#9b5de5"}</span>
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="color" 
                      value={config.image_config?.avatar?.border_color ?? "#9b5de5"}
                      onChange={(e) => updateAvatar("border_color", e.target.value)}
                      className="bg-transparent border-0 w-8 h-8 rounded cursor-pointer p-0"
                    />
                    <input 
                      type="text" 
                      value={config.image_config?.avatar?.border_color ?? "#9b5de5"}
                      onChange={(e) => updateAvatar("border_color", e.target.value)}
                      className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Text Layers Designer */}
            <div className="bg-[#141B2D] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Text Layers Designer
                </h3>
                <div className="w-full md:w-64">
                  <Select
                    value={activeTextLayer}
                    onValueChange={(val) => setActiveTextLayer(val)}
                    options={textLayerOptions}
                  />
                </div>
              </div>

              <div className="bg-[#0f172a]/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400">Content (Supports Variables)</label>
                  <input 
                    type="text" 
                    value={currentTextLayer.content || ""}
                    onChange={(e) => updateText(activeTextLayer, "content", e.target.value)}
                    placeholder="Welcome {user}!"
                    className="w-full mt-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 flex justify-between">
                      <span>Position X (Horizontal Center)</span>
                      <span className="text-slate-500 font-mono">{currentTextLayer.x}px</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max={canvasWidth}
                      value={currentTextLayer.x}
                      onChange={(e) => updateText(activeTextLayer, "x", parseInt(e.target.value))}
                      className="w-full mt-2 accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 flex justify-between">
                      <span>Position Y (Vertical Center)</span>
                      <span className="text-slate-500 font-mono">{currentTextLayer.y}px</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max={canvasHeight}
                      value={currentTextLayer.y}
                      onChange={(e) => updateText(activeTextLayer, "y", parseInt(e.target.value))}
                      className="w-full mt-2 accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 flex justify-between">
                      <span>Font Size (px)</span>
                      <span className="text-slate-500 font-mono">{currentTextLayer.font_size}px</span>
                    </label>
                    <input 
                      type="number" 
                      value={currentTextLayer.font_size}
                      onChange={(e) => updateText(activeTextLayer, "font_size", parseInt(e.target.value) || 12)}
                      className="w-full mt-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 flex justify-between">
                      <span>Color</span>
                      <span className="text-slate-500 font-mono">{currentTextLayer.color}</span>
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="color" 
                        value={currentTextLayer.color}
                        onChange={(e) => updateText(activeTextLayer, "color", e.target.value)}
                        className="bg-transparent border-0 w-8 h-8 rounded cursor-pointer p-0"
                      />
                      <input 
                        type="text" 
                        value={currentTextLayer.color}
                        onChange={(e) => updateText(activeTextLayer, "color", e.target.value)}
                        className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:col-span-2 border-t border-slate-800/50 pt-4 mt-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Bold Text</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Toggle between bold and regular font weight for this text layer.</p>
                    </div>
                    <Switch 
                      checked={currentTextLayer.is_bold !== undefined ? currentTextLayer.is_bold : true}
                      onCheckedChange={(val) => updateText(activeTextLayer, "is_bold", val)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatVar(text: string, serverName: string = "Vada SMP") {
  return text.replace(/{server_name}/g, serverName);
}
