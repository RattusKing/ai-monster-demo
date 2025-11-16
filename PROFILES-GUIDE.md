# 🎭 EchoSprite Avatar Profiles - Complete Guide

**Multiple avatar themes/outfits with instant switching!**

---

## 🎯 What Are Profiles?

Profiles allow you to create **multiple avatar sets** (themes) and switch between them instantly. Each profile has its own 4-state avatar (idle, talking, muted, deafened).

### **Use Cases:**
- 🎮 **Different outfits** - Casual, Gaming, Formal, Cosplay
- 🎃 **Seasonal themes** - Halloween, Christmas, Valentine's
- 🎨 **Stream types** - Chatting avatar, Gaming avatar, Cooking avatar
- 🤝 **Collaborations** - Special collab outfit
- 💼 **Brand partnerships** - Sponsored stream avatars

---

## 🚀 Quick Start

### **Creating Your First Profile:**

```
/profile create name:"Gaming Mode"
/profile upload profile:"Gaming Mode" idle:gaming_idle.png talking:gaming_talk.png
```

### **Switching Profiles Mid-Stream:**

```
/profile switch profile:"Gaming Mode"
```

Your OBS browser source updates automatically! ✨

---

## 📋 Discord Commands

### **/profile create**
Create a new avatar profile

**Options:**
- `name` (required) - Profile name (e.g., "Casual Outfit", "Halloween 2024")

**Example:**
```
/profile create name:"Casual Outfit"
```

**Response:**
- Profile ID and slug
- Status (active/inactive)
- Next step instructions
- Profile-specific URL

**Notes:**
- Maximum 20 profiles per user
- First profile is automatically set as active
- Profile names are converted to URL-friendly slugs

---

### **/profile upload**
Upload avatar images to a specific profile

**Options:**
- `profile` (required, autocomplete) - Profile name
- `idle` (required) - Idle state image
- `talking` (required) - Talking state image
- `muted` (optional) - Muted state image
- `deafened` (optional) - Deafened state image

**Example:**
```
/profile upload profile:"Gaming Mode" idle:idle.png talking:talk.png muted:mute.png deafened:deaf.png
```

**File Requirements:**
- Formats: PNG, JPEG, GIF, WebP
- Max size: 10MB per image
- Transparent backgrounds recommended

---

### **/profile list**
List all your avatar profiles

**Response:**
- All your profiles with status indicators:
  - ⭐ = Currently active
  - ✅ = Has images uploaded
  - ❌ = No images yet

**Example output:**
```
1. **Casual Outfit** (⭐ ACTIVE) ✅
2. **Gaming Mode** (⏸️ Inactive) ✅
3. **Halloween** (⏸️ Inactive) ❌
```

---

### **/profile switch**
Switch to a different profile (makes it active)

**Options:**
- `profile` (required, autocomplete) - Profile name to switch to

**Example:**
```
/profile switch profile:"Gaming Mode"
```

**What happens:**
- Selected profile becomes active
- OBS browser source updates automatically (if using default URL)
- All previous active profile becomes inactive

**Perfect for:**
- Mid-stream outfit changes
- Switching between stream segments
- Seasonal transitions

---

### **/profile url**
Get OBS browser source URL for a specific profile

**Options:**
- `profile` (optional, autocomplete) - Profile name (leave empty for active profile)

**Example:**
```
/profile url profile:"Gaming Mode"
```

**Response:**
Two types of URLs:

1. **Profile-Specific URL:**
   ```
   https://rattusking.github.io/echosprite/viewer.html?userId=123&mode=discord&profile=gaming-mode
   ```
   - Always shows this specific profile
   - Doesn't change when you switch active profile

2. **Default URL:**
   ```
   https://rattusking.github.io/echosprite/viewer.html?userId=123&mode=discord
   ```
   - Shows your currently active profile
   - Updates when you switch profiles

---

### **/profile delete**
Delete a profile permanently

**Options:**
- `profile` (required, autocomplete) - Profile name to delete

**Example:**
```
/profile delete profile:"Old Outfit"
```

**Notes:**
- Cannot delete your only profile
- If deleting active profile, another profile auto-activates
- **This is permanent and cannot be undone!**

---

### **/profile rename**
Rename a profile

**Options:**
- `old` (required, autocomplete) - Current profile name
- `new` (required) - New profile name

**Example:**
```
/profile rename old:"Gamingg Mode" new:"Gaming Mode"
```

**Important:**
- Profile URL will change
- If using profile-specific URL in OBS, you'll need to update it
- Active status is preserved

---

## 🎨 Workflow Examples

### **Scenario 1: Seasonal Avatars**

**Setup (October):**
```
/profile create name:"Halloween 2024"
/profile upload profile:"Halloween 2024" idle:pumpkin_idle.png talking:pumpkin_talk.png
/profile switch profile:"Halloween 2024"
```

**Switch back (November):**
```
/profile switch profile:"Casual"
```

---

### **Scenario 2: Stream Segment Switching**

**During chatting segment:**
```
/profile switch profile:"Casual Chat"
```

**Switching to gaming:**
```
/profile switch profile:"Gaming Mode"
```

**Cooking stream:**
```
/profile switch profile:"Chef Outfit"
```

---

### **Scenario 3: Pre-Configured OBS Scenes**

**Setup in OBS:**
- Scene 1: Browser Source → `viewer.html?profile=casual`
- Scene 2: Browser Source → `viewer.html?profile=gaming`
- Scene 3: Browser Source → `viewer.html?profile=formal`

**During stream:**
Just switch OBS scenes = instant avatar change!

---

## 🔗 URL Formats

### **Profile-Specific URL:**
```
viewer.html?userId=YOUR_ID&mode=discord&profile=PROFILE_SLUG
```

**Use when:**
- You want to lock a specific OBS source to one profile
- Setting up multiple OBS scenes with different profiles
- Sharing a specific themed avatar

### **Dynamic URL (Active Profile):**
```
viewer.html?userId=YOUR_ID&mode=discord
```

**Use when:**
- You want one OBS source that changes when you switch profiles
- Quick mid-stream outfit changes via `/profile switch`
- Don't want to manage multiple OBS sources

### **Group URL (All Voice Channel Members):**
```
viewer-group.html?channelId=CHANNEL_ID
```

**Notes:**
- Shows all members' **active** profiles
- Updates in real-time
- Perfect for collaborations

---

## ⚙️ OBS Setup Options

### **Option A: Single Dynamic Source** (Easiest)

1. Add one Browser Source to OBS
2. URL: `viewer.html?userId=YOUR_ID&mode=discord` (no profile parameter)
3. Switch profiles with `/profile switch`
4. OBS updates automatically

**Pros:**
- ✅ One source, easy setup
- ✅ Mid-stream switching via Discord
- ✅ No OBS configuration changes

**Cons:**
- ❌ Requires Discord command to switch

---

### **Option B: Multiple Profile Sources** (Most Flexible)

1. Add multiple Browser Sources to OBS:
   - Source 1: `viewer.html?profile=casual`
   - Source 2: `viewer.html?profile=gaming`
   - Source 3: `viewer.html?profile=formal`

2. Show/hide sources or switch scenes in OBS

**Pros:**
- ✅ Instant switching in OBS (no Discord needed)
- ✅ Can prepare scenes ahead of time
- ✅ No lag or loading

**Cons:**
- ❌ Initial setup takes longer
- ❌ More OBS sources to manage

---

### **Option C: Hybrid** (Best of Both)

1. Main scene: Dynamic URL (active profile)
2. Special scenes: Profile-specific URLs
3. Use `/profile switch` for quick changes
4. Use OBS scenes for pre-planned segments

---

## 📊 Profile Management

### **Profile Limits:**
- Maximum: 20 profiles per user
- Minimum: 1 profile (cannot delete your only profile)

### **Profile States:**
- **Active** (⭐) - Currently shown when using default URL
- **Inactive** (⏸️) - Available but not active
- **With Images** (✅) - Has all required images uploaded
- **Without Images** (❌) - Created but no images yet

### **Profile Slugs:**
Profile names are converted to URL-friendly slugs:
- "Gaming Mode" → `gaming-mode`
- "Halloween 2024" → `halloween-2024`
- "Chef Outfit!" → `chef-outfit`

Slugs are used in URLs and must be unique per user.

---

## 🎯 Best Practices

### **Naming Conventions:**
```
✅ Good: "Casual Outfit", "Gaming Mode", "Halloween 2024"
❌ Avoid: "aaa", "test", "profile1"
```

Use descriptive names that make sense!

### **Organizing Profiles:**
- Create profiles for different stream types
- Seasonal profiles (keep year in name)
- Event-specific profiles (collabs, sponsored streams)
- Test profile for trying new avatars

### **Image Management:**
- Keep source files organized
- Use consistent dimensions across profiles
- Test images before uploading
- Transparent backgrounds work best

### **URL Strategy:**
Decide early:
- **Dynamic URL** - If you switch often mid-stream
- **Profile-specific URLs** - If you have preset scenes
- **Hybrid** - Mix of both for flexibility

---

## 🐛 Troubleshooting

### **"Profile already exists"**
- You have a profile with that name (or similar slug)
- Use `/profile list` to see existing profiles
- Choose a different name or delete the old one

### **"Profile not found" when switching**
- Profile name might have changed
- Use `/profile list` to see exact names
- Autocomplete helps avoid typos

### **OBS not updating after switch**
- Using profile-specific URL? It won't change.
- Solution: Use default URL for dynamic switching
- Or: Manually change OBS source URL

### **"Cannot delete profile"**
- You can't delete your only profile
- Create another profile first
- Then delete the unwanted one

### **Profile limit reached (20)**
- Delete unused profiles
- Archive old seasonal profiles
- Consider which profiles you actually use

---

## 📈 Analytics

Profile activity is tracked:
- Profile creation
- Profile uploads
- Profile switches
- Profile deletions
- Profile renames

View stats: `/api/analytics/stats`

---

## 🔄 Migration from Old System

If you were using EchoSprite before profiles:

**Automatic Migration:**
- Your existing avatar → "Default" profile
- Automatically set as active
- Works with existing OBS URLs

**No action needed!** Everything continues working.

---

## 💡 Pro Tips

### **Tip 1: Pre-Record Transitions**
Create transition scenes in OBS:
- Fade to black
- Switch profile
- Fade in
= Smooth outfit change reveal!

### **Tip 2: Test Before Stream**
```
/profile create name:"Test"
/profile upload profile:"Test" idle:new_idle.png talking:new_talk.png
/profile url profile:"Test"
```
Test in OBS before making it active!

### **Tip 3: Seasonal Rotation**
Keep seasonal profiles year-round:
- "Halloween 2024"
- "Christmas 2024"
- "Valentine 2025"

Easy to find and reuse next year!

### **Tip 4: Collaboration Coordination**
Before collab streams:
```
/profile create name:"Collab with @Friend"
/profile upload ... (matching theme)
/profile switch profile:"Collab with @Friend"
```

Coordinated outfit reveals! 🎉

### **Tip 5: Brand Safety**
For sponsored streams:
```
/profile create name:"Sponsored - Brand X"
/profile upload ... (brand-appropriate avatar)
/profile switch profile:"Sponsored - Brand X"
```

Keep brand content separate!

---

## 🎬 Example Stream Schedule

**Morning Chatting (9 AM):**
```
/profile switch profile:"Casual Morning"
```

**Midday Gaming (12 PM):**
```
/profile switch profile:"Gaming Mode"
```

**Evening Cooking (6 PM):**
```
/profile switch profile:"Chef Outfit"
```

**Night Karaoke (9 PM):**
```
/profile switch profile:"Stage Outfit"
```

All via simple Discord commands! No OBS configuration changes needed!

---

## 📞 Support

- **Discord Commands**: `/help`
- **Bot Status**: `/status`
- **Documentation**: [GitHub Repo](https://github.com/RattusKing/echosprite)
- **Full Command List**: [DISCORD-COMMANDS.md](DISCORD-COMMANDS.md)

---

## 🎉 Summary

**What You Can Do:**
✅ Create up to 20 different avatar profiles (themes)
✅ Upload unique 4-state avatars to each profile
✅ Switch between profiles instantly via Discord
✅ Get unique URLs for each profile (or use dynamic URL)
✅ Manage profiles: rename, delete, list
✅ Use in OBS with multiple strategies

**Why It's Awesome:**
🎨 **Creative freedom** - Different looks for different streams
⚡ **Instant switching** - No OBS reconfiguration needed
🎯 **Flexible** - Multiple workflow options
📊 **Organized** - Keep all your avatars in one place
🚀 **Professional** - Seamless transitions and variety

---

**Made with 💜 for VTubers who love variety!**

*Reactive avatars, infinite possibilities.*
