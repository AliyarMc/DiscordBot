# ╔══════════════════════════════════════════════════════════════════╗
# ║                                                                  ║
# ║   ░█▀▀░█▀█░█▀▄░█▀▀░█░█   ░█▀▄░█▀▀░█░█░█▀▀                     ║
# ║   ░█░░░█░█░█░█░█▀▀░▄▀▄   ░█░█░█▀▀░▀▄▀░▀▀█                     ║
# ║   ░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀░▀   ░▀▀░░▀▀▀░░▀░░▀▀▀                     ║
# ║                                                                  ║
# ║            © 2026 CodeX Devs — All Rights Reserved              ║
# ║                                                                  ║
# ║   discord  ──  https://discord.gg/codexdev                      ║
# ║   youtube  ──  https://youtube.com/@CodeXDevs                   ║
# ║   github   ──  https://github.com/RayExo                        ║
# ║                                                                  ║
# ╚══════════════════════════════════════════════════════════════════╝

import discord
from utils.emoji import BLOBPART
from discord.ext import commands
import json
from utils.cv2 import CV2

class joindm(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.joindm_messages = {}
        self.load_joindm_messages()

    def load_joindm_messages(self):
        # Load the join DM messages from file
        try:
            with open('jsondb/joindm_messages.json', 'r') as f:
                self.joindm_messages = json.load(f)
        except FileNotFoundError:
            self.joindm_messages = {}

    def save_joindm_messages(self):
        # Save the join DM messages to file
        with open('jsondb/joindm_messages.json', 'w') as f:
            json.dump(self.joindm_messages, f)

    @commands.group(invoke_without_command=True)
    @commands.has_permissions(administrator=True)
    async def joindm(self, ctx):
        # Display the current join DM message
        guild_id = str(ctx.guild.id)
        if guild_id in self.joindm_messages:
            await ctx.send(view=CV2("✅ Join DM Status", f"The current join DM message is:\n`{self.joindm_messages[guild_id]}`"))
        else:
            await ctx.send(view=CV2("❌ Error", "No custom join DM message has been set for this server."))

    @joindm.command()
    @commands.has_permissions(administrator=True)
    async def message(self, ctx, *, message=None):
        # Set the custom join DM message
        if message is None:
            await ctx.send(view=CV2("❌ Error", "Please provide a custom join DM message."))
        else:
            self.joindm_messages[str(ctx.guild.id)] = message
            self.save_joindm_messages()
            await ctx.send(view=CV2("✅ Success", "Custom join DM message set successfully."))

    @joindm.command()
    @commands.has_permissions(administrator=True)
    async def enable(self, ctx):
        # Enable the join DM module
        guild_id = str(ctx.guild.id)
        config = self.joindm_messages.get(guild_id, {})
        if isinstance(config, str):
            config = {"message": config}
        config["enabled"] = True
        self.joindm_messages[guild_id] = config
        self.save_joindm_messages()
        await ctx.send(view=CV2("✅ Success", "Join DM module enabled. Custom DM will be sent to new members."))

    @joindm.command()
    @commands.has_permissions(administrator=True)
    async def disable(self, ctx):
        # Disable the join DM module
        guild_id = str(ctx.guild.id)
        config = self.joindm_messages.get(guild_id, {})
        if isinstance(config, str):
            config = {"message": config}
        config["enabled"] = False
        self.joindm_messages[guild_id] = config
        self.save_joindm_messages()
        await ctx.send(view=CV2("✅ Success", "Join DM module disabled. Custom DM will not be sent to new members."))

    @joindm.command()
    async def test(self, ctx):
        # Send a test join DM to the author of the command
        guild_id = str(ctx.guild.id)
        if guild_id in self.joindm_messages:
            config = self.joindm_messages[guild_id]
            enabled = True
            message = ""
            embed_enabled = False
            embed_data = None
            
            if isinstance(config, dict):
                enabled = config.get("enabled", True)
                message = config.get("message", "")
                embed_enabled = config.get("embed_enabled", False)
                embed_data = config.get("embed_data", None)
            else:
                message = config
                
            server_name = ctx.guild.name
            
            placeholders = {
                "user_name": ctx.author.name,
                "user_mention": ctx.author.mention,
                "server_name": server_name
            }
            
            def format_text(txt):
                if not txt:
                    return ""
                for k, v in placeholders.items():
                    txt = txt.replace(f"{{{k}}}", str(v))
                return txt

            await ctx.send(view=CV2("✅ Test Sent", "Test Join DM Sent To Your Dm"))
            await ctx.message.add_reaction(BLOBPART)
            
            try:
                dm_channel = await ctx.author.create_dm()
                if embed_enabled and embed_data:
                    title = format_text(embed_data.get("title", ""))
                    desc = format_text(embed_data.get("description", ""))
                    color_hex = embed_data.get("color") or "#FF6B00"
                    image_url = format_text(embed_data.get("image_url", ""))
                    thumbnail_url = format_text(embed_data.get("thumbnail_url", ""))
                    footer = format_text(embed_data.get("footer_text", ""))
                    
                    color_val = 0xFF6B00
                    if color_hex.startswith("#"):
                        try:
                            color_val = int(color_hex.lstrip("#"), 16)
                        except:
                            pass
                            
                    embed = discord.Embed(
                        title=title or None,
                        description=desc or None,
                        color=color_val
                    )
                    if image_url:
                        embed.set_image(url=image_url)
                    if thumbnail_url:
                        embed.set_thumbnail(url=thumbnail_url)
                    if footer:
                        embed.set_footer(text=footer)
                        
                    await dm_channel.send(content=format_text(message) or None, embed=embed)
                else:
                    join_dm_message = f"{format_text(message)}\n\n ``Sent from {server_name} `` "
                    await dm_channel.send(view=CV2("👋 Welcome", join_dm_message))
            except Exception as e:
                await ctx.send(view=CV2("❌ Error", f"Failed to send DM: {e}"))
        else:
            await ctx.send(view=CV2("❌ Error", "No custom join DM message has been set for this server."))

    @commands.Cog.listener()
    async def on_member_join(self, member):
        guild_id = str(member.guild.id)
        if guild_id in self.joindm_messages:
            config = self.joindm_messages[guild_id]
            enabled = True
            message = ""
            embed_enabled = False
            embed_data = None
            
            if isinstance(config, dict):
                enabled = config.get("enabled", True)
                message = config.get("message", "")
                embed_enabled = config.get("embed_enabled", False)
                embed_data = config.get("embed_data", None)
            else:
                message = config

            if not enabled:
                return

            try:
                dm_channel = await member.create_dm()
                server_name = member.guild.name
                
                placeholders = {
                    "user_name": member.name,
                    "user_mention": member.mention,
                    "server_name": server_name
                }
                
                def format_text(txt):
                    if not txt:
                        return ""
                    for k, v in placeholders.items():
                        txt = txt.replace(f"{{{k}}}", str(v))
                    return txt

                if embed_enabled and embed_data:
                    title = format_text(embed_data.get("title", ""))
                    desc = format_text(embed_data.get("description", ""))
                    color_hex = embed_data.get("color") or "#FF6B00"
                    image_url = format_text(embed_data.get("image_url", ""))
                    thumbnail_url = format_text(embed_data.get("thumbnail_url", ""))
                    footer = format_text(embed_data.get("footer_text", ""))
                    
                    color_val = 0xFF6B00
                    if color_hex.startswith("#"):
                        try:
                            color_val = int(color_hex.lstrip("#"), 16)
                        except:
                            pass
                            
                    embed = discord.Embed(
                        title=title or None,
                        description=desc or None,
                        color=color_val
                    )
                    if image_url:
                        embed.set_image(url=image_url)
                    if thumbnail_url:
                        embed.set_thumbnail(url=thumbnail_url)
                    if footer:
                        embed.set_footer(text=footer)
                        
                    await dm_channel.send(content=format_text(message) or None, embed=embed)
                else:
                    join_dm_message = f"{format_text(message)}\n\n``Sent from {server_name} ``"
                    await dm_channel.send(view=CV2("👋 Welcome", join_dm_message))
            except Exception as e:
                print(f"Error sending Join DM to {member.name}: {e}")

async def setup(bot):
    await bot.add_cog(joindm(bot))
