"use client";

import React, { useRef, useEffect, useState } from "react";
import { WelcomeImageConfig } from "@/types/api";

interface WelcomePreviewCanvasProps {
  imageConfig?: WelcomeImageConfig | null;
  serverName?: string;
}

export function WelcomePreviewCanvas({ imageConfig, serverName = "UNDERWORLD Δ REBIRTH" }: WelcomePreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [avatarImage, setAvatarImage] = useState<HTMLImageElement | null>(null);

  const canvasWidth = imageConfig?.canvas?.width || 1020;
  const canvasHeight = imageConfig?.canvas?.height || 450;
  const bgType = imageConfig?.canvas?.background_type || "gradient";
  const bgImageUrl = imageConfig?.canvas?.background_image_url || "";
  const bgColor = imageConfig?.canvas?.background_color || "#0f081d";
  const grad1 = imageConfig?.canvas?.gradient_color1 || "#0f081d";
  const grad2 = imageConfig?.canvas?.gradient_color2 || "#2b0a3d";
  const overlayOpacity = imageConfig?.canvas?.overlay_opacity !== undefined ? imageConfig.canvas.overlay_opacity : 0.4;
  const borderThickness = imageConfig?.canvas?.border_thickness !== undefined ? imageConfig.canvas.border_thickness : 8;
  const borderColor = imageConfig?.canvas?.border_color || "#9b5de5";

  const avX = imageConfig?.avatar?.x !== undefined ? imageConfig.avatar.x : 510;
  const avY = imageConfig?.avatar?.y !== undefined ? imageConfig.avatar.y : 180;
  const avSize = imageConfig?.avatar?.size !== undefined ? imageConfig.avatar.size : 180;
  const avShape = imageConfig?.avatar?.shape || "rounded";
  const avBorderThickness = imageConfig?.avatar?.border_thickness !== undefined ? imageConfig.avatar.border_thickness : 8;
  const avBorderColor = imageConfig?.avatar?.border_color || "#9b5de5";

  // Preload Background Image if bgType is image
  useEffect(() => {
    if (bgType === "image" && bgImageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = bgImageUrl;
      img.onload = () => setBgImage(img);
      img.onerror = () => {
        console.error("Failed to load welcome background preview image");
        setBgImage(null);
      };
    } else {
      setBgImage(null);
    }
  }, [bgType, bgImageUrl]);

  // Preload Avatar Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/assets/mc-head.png"; // Fallback to MC head or standard avatar
    img.onload = () => setAvatarImage(img);
    img.onerror = () => {
      // Try fallback to Discord default avatar
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = "anonymous";
      fallbackImg.src = "https://cdn.discordapp.com/embed/avatars/0.png";
      fallbackImg.onload = () => setAvatarImage(fallbackImg);
      fallbackImg.onerror = () => setAvatarImage(null);
    };
  }, []);

  // Format placeholders
  const formatText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/{user}/g, "@dinixooji.")
      .replace(/{user_name}/g, "dinixooji.")
      .replace(/{user_id}/g, "123456789012345678")
      .replace(/{user_nick}/g, "dinixooji.")
      .replace(/{server_name}/g, serverName)
      .replace(/{server_membercount}/g, "364")
      .replace(/{user_joindate}/g, "Tue, Aug 25, 2026")
      .replace(/{user_createdate}/g, "Sun, Jan 10, 2021");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Background
    if (bgType === "solid") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (bgType === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      grad.addColorStop(0, grad1);
      grad.addColorStop(1, grad2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (bgType === "image" && bgImage) {
      // Draw cover image
      const scale = Math.max(canvasWidth / bgImage.width, canvasHeight / bgImage.height);
      const x = (canvasWidth / 2) - (bgImage.width / 2) * scale;
      const y = (canvasHeight / 2) - (bgImage.height / 2) * scale;
      ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);

      // Draw overlay
      if (overlayOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    } else {
      // Fallback background color
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 2. Draw Canvas Border
    if (borderThickness > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderThickness;
      ctx.strokeRect(borderThickness / 2, borderThickness / 2, canvasWidth - borderThickness, canvasHeight - borderThickness);
    }

    // 3. Draw Avatar
    if (avatarImage) {
      ctx.save();
      if (avShape === "rounded") {
        ctx.beginPath();
        ctx.arc(avX, avY, avSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImage, avX - avSize / 2, avY - avSize / 2, avSize, avSize);
        ctx.restore();

        // Draw Border
        if (avBorderThickness > 0) {
          ctx.strokeStyle = avBorderColor;
          ctx.lineWidth = avBorderThickness;
          ctx.beginPath();
          ctx.arc(avX, avY, avSize / 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.drawImage(avatarImage, avX - avSize / 2, avY - avSize / 2, avSize, avSize);
        ctx.restore();

        // Draw Border
        if (avBorderThickness > 0) {
          ctx.strokeStyle = avBorderColor;
          ctx.lineWidth = avBorderThickness;
          ctx.strokeRect(avX - avSize / 2, avY - avSize / 2, avSize, avSize);
        }
      }
    }

    // 4. Draw Texts
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const texts = imageConfig?.texts || {};
    Object.entries(texts).forEach(([key, value]) => {
      if (value && value.content) {
        const textContent = formatText(value.content);
        const fontColor = value.color || "#ffffff";
        const fontSize = value.font_size || 24;
        const tx = value.x;
        const ty = value.y;

        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = fontColor;
        ctx.fillText(textContent, tx, ty);
      }
    });

  }, [
    canvasWidth, canvasHeight, bgType, bgImage, bgColor, grad1, grad2,
    overlayOpacity, borderThickness, borderColor, avatarImage, avX, avY,
    avSize, avShape, avBorderThickness, avBorderColor, imageConfig
  ]);

  return (
    <div className="w-full relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2 shadow-2xl">
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur border border-white/10 rounded-full px-3 py-1 text-[10px] uppercase font-black text-slate-400 tracking-wider z-10">
        Live Canvas Preview
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="w-full h-auto block rounded-2xl"
        style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
      />
    </div>
  );
}
