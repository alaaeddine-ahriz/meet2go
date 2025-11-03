# Meet2Go - Product Requirements Document

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Status:** Development Ready

---

## 1. Executive Summary

### 1.1 Product Overview
Meet2Go is a mobile-first group decision-making app that transforms chaotic group chat discussions into organized, fair, and fun voting experiences. Using an intuitive swipe-based interface, friends can quickly express preference strength on various options, enabling groups to reach consensus faster and move from planning to doing.

### 1.2 Problem Statement
Friend groups struggle to make collective decisions because discussions in group chats quickly become chaotic and fail to capture the strength and fairness of individual preferences. Traditional polls offer only binary yes/no choices, missing the nuance of "I'm okay with this" vs "I really want this."

### 1.3 Target Users
- **Primary:** Young adults (18-30) who regularly plan group activities
- **Secondary:** College students, friend groups, trip planners
- **Use Cases:** Weekend plans, trip planning, restaurant choices, activity coordination

### 1.4 Success Metrics
- Time from poll creation to group decision < 5 minutes
- 80%+ completion rate on polls
- 70%+ users return within 7 days
- Average 3+ polls per quest
- NPS > 40

---

## 2. Core Features

### 2.1 Quest Management (Container for Decisions)

#### 2.1.1 Create Quest
**User Story:** As a trip organizer, I want to create a dedicated space for all decisions related to my trip, so everything stays organized in one place.

**Acceptance Criteria:**
- User can tap "+ New Quest" from home screen
- Required fields:
  - Quest name (e.g., "Japan Trip", "Night Out")
  - End date (formerly "expiry date")
- Generated unique invite code/link automatically
- Quest appears immediately in user's quest list
- Quest creator becomes admin by default

**UI/UX Notes:**
- Use clear terminology: "Quest" or consider "Trip"/"Group" (test with users)
- Emphasize that quest = container for multiple polls
- Show success confirmation with invite link prominent

#### 2.1.2 Join Quest
**User Story:** As a friend invited to a trip, I want to easily join the planning space via a link, so I can participate in decisions.

**Acceptance Criteria:**
- User can join via deep link (meet2go://quest/{invite_code})
- User can manually enter invite code
- Universal link support for web → app transition
- Joined quest appears in home screen list
- User immediately sees all polls in quest

**Technical Notes:**
- Implement Expo deep linking
- Handle web-to-app handoff gracefully
- Validate invite codes server-side

#### 2.1.3 Quest Detail View
**User Story:** As a quest member, I want to see all polls for this trip in one place, so I know what still needs to be decided.

**Must Have:**
- Quest name and end date at top
- List of all polls with status badges:
  - "3/10 ANSWERS" (voting in progress)
  - "RESULTS AVAILABLE" (voting complete)
  - "NO VOTE" (user hasn't voted yet)
- "+ New Poll" button
- "Share" button (bottom left)
- "Home" button (bottom right)
- Member list (show avatars/names)

**Nice to Have:**
- Progress indicator (X/Y polls completed)
- Upcoming deadline warnings
- Activity feed (who voted recently)

### 2.2 Poll Management

#### 2.2.1 Create Poll
**User Story:** As a quest admin, I want to create a poll for a specific decision, so the group can vote on options.

**Acceptance Criteria:**
- User taps "+ New Poll" from quest detail
- Required field: Poll name (e.g., "Where to eat?", "Monday activity")
- Optional field: Deadline (date/time)
- Initially empty - creator adds options next
- Poll appears in quest immediately

**UI/UX Notes:**
- "NEXT" button confused users → rename to "Create Poll"
- Keep flow simple, 2 steps max
- Auto-save draft if user backs out

#### 2.2.2 Add Poll Options
**User Story:** As a poll creator, I want to add multiple options with images, so people can vote on concrete choices.

**Acceptance Criteria:**
- User can add unlimited options (practical limit: 20)
- Each option has:
  - Required: Name (text input)
  - Optional: Image (camera/gallery picker)
- Auto-suggest images based on text (nice to have)
- Creator's first added option auto-votes "Amazing"
- Keyboard dismisses when tapping outside or swiping down
- "CREATE" button finalizes poll

**Technical Notes:**
- Image upload to Supabase Storage
- Compress images client-side (max 1MB)
- Handle keyboard blocking issue (fixed in testing)

**UI Fix from Testing:**
- After 4th option, keyboard blocks view → allow tap-anywhere-to-dismiss
- Add visual indicator that more options below (scroll hint)

#### 2.2.3 Add Options After Creation
**User Story:** As a quest member, I want to suggest additional options after voting, so we can consider ideas that come up later.

**Acceptance Criteria:**
- "+ Add Option" button visible after voting
- Same option creation flow as poll creator
- New options appear at bottom of poll
- All users notified of new option
- Users can vote on new options immediately

### 2.3 Swipe-Based Voting

#### 2.3.1 Voting Interface
**User Story:** As a voter, I want to quickly express how I feel about each option using natural gestures, so voting feels effortless and fun.

**Core Interaction:**
- **Swipe Left:** "Doesn't Work" (❌ red) = -1 point
- **Swipe Right:** "Works" (✅ green) = +1 point
- **Swipe Up:** "Amazing" (😍 gold) = +3 points

**Acceptance Criteria:**
- Card-based interface (Tinder-style)
- One option shown at a time (fullscreen card)
- Option name overlaid on image
- Visual feedback during swipe:
  - Card rotates slightly in swipe direction
  - Color overlay appears (red/green/gold)
  - Emoji indicator shows (❌/✅/😍)
- Card flies off screen on release
- Next card animates in from stack
- "Previous" button to change previous vote
- Counter shows progress (e.g., "2/5")

**First-Time User Experience:**
- Show brief tutorial overlay on first poll
- Animated hint arrows showing three directions
- Text labels: "Doesn't Work ←  |  Works →  |  Amazing ↑"
- Can be skipped

**UI/UX Notes:**
- Swipe preferred over "hold-to-indicate" (user testing feedback)
- Must feel playful and engaging
- Minimum swipe threshold: 50px
- Velocity matters for satisfying feedback

**Technical Notes:**
```typescript
// Gesture thresholds
SWIPE_THRESHOLD = 100; // pixels
SWIPE_VELOCITY = 0.5; // units/ms
CARD_ROTATION = 15; // degrees max

// Vote detection logic
if (translationY < -THRESHOLD) → amazing
else if (translationX > THRESHOLD) → works  
else if (translationX < -THRESHOLD) → doesnt_work
```

#### 2.3.2 Vote Completion
**User Story:** As a voter, I want to know when I'm done voting, so I can see results or add suggestions.

**Acceptance Criteria:**
- After last card: "YOU'RE SET! 🚀" confirmation screen
- Two action buttons:
  - "SEE RESULTS" (primary CTA)
  - "+ ADD OPTION" (secondary)
- Home button always visible
- Vote saves automatically after each swipe

**Edge Cases:**
- Empty polls (no options yet) → show "No options yet. Add one!"
- Single option → still show swipe interface
- Re-voting → Previous button goes back through cards

### 2.4 Results & Analytics

#### 2.4.1 Results View
**User Story:** As a voter, I want to see which option won and how the group feels, so we can make a final decision together.

**Acceptance Criteria:**
- Ranked list of all options (highest score first)
- Each option shows:
  - Option name and image (thumbnail)
  - Trophy icon 🏆 for winner
  - Vote counts: "4😍 6✅ 0❌"
  - Total score (calculated)
- Tappable to see detailed breakdown
- "+ ADD OPTION" button at bottom
- Back navigation to quest

**Scoring Algorithm:**
```
Score = (Amazing × 3) + (Works × 1) + (Doesn't Work × -1)

Tiebreaker: Most "Amazing" votes wins
```

**Visual Design:**
- Winner highlighted (gold background)
- Clear ranking (1st, 2nd, 3rd)
- Color-coded vote types

#### 2.4.2 Detailed Vote Breakdown
**User Story:** As a result viewer, I want to see who voted what, so I understand the group's preferences better.

**Acceptance Criteria:**
- Tap any option → modal/new screen
- Shows list of voters per vote type:
  - 😍 Amazing: [John Doe, Mike Main, Aziz Badass, Julia G]
  - ✅ Works: [names...]
  - ❌ Doesn't Work: [names...]
- Toggle buttons to switch between vote types
- "← RESULTS" back button

**Privacy Note:**
- Votes are public within quest
- Clear expectation setting in onboarding

#### 2.4.3 Results Access Control
**User Story:** As a non-voter, I should vote before seeing results, so I'm not influenced by others' votes.

**Acceptance Criteria:**
- Results locked until user votes
- Attempting to view shows: "Vote first to see results!"
- After voting, results immediately accessible
- Poll creator can always see results

**Rationale from Testing:**
- Prevents bias/herding
- Incentivizes participation
- Captures authentic preferences

### 2.5 Navigation & Information Architecture

#### 2.5.1 Home Screen
**Must Have:**
- "UPCOMING" section header
- List of active quests (cards)
  - Quest name (large, bold)
  - Quest date
- "+ NEW QUEST" button (prominent, blue)
- Bottom navigation/home indicator

**Nice to Have:**
- "PAST" section (archived quests)
- Quick stats (X pending votes)
- Search/filter quests

#### 2.5.2 Global Navigation
**Consistency Requirements (from user testing):**
- Home button present on ALL screens (bottom right)
- Consistent back button behavior
- Status bar visible
- Loading states for all async actions

#### 2.5.3 Share Flow
**User Story:** As a quest creator, I want to easily invite friends after creating a quest/poll.

**Acceptance Criteria:**
- Share button accessible from:
  - Quest detail screen (bottom left)
  - After creating quest (prompt)
  - After creating poll (optional prompt)
- Native share sheet with:
  - Copy link option
  - Share to messaging apps
  - Generated invite message template

**Invite Message Template:**
```
Join my quest "{Quest Name}" on Meet2Go!
Link: meet2go://quest/{invite_code}
```

---

## 3. User Flows

### 3.1 First-Time User Journey
1. Download app / Open web version
2. Sign up (email/social auth)
3. See empty home screen with "+ NEW QUEST"
4. **Onboarding overlay:**
   - "Welcome to Meet2Go!"
   - "Create a Quest for your trip or event"
   - "Add polls for group decisions"
   - "Swipe to vote on options"
5. Create first quest (guided)

### 3.2 Core Voting Flow
1. Receive quest invite link
2. Tap link → app opens (or download prompt)
3. Join quest (auto-adds to home)
4. See quest detail with polls
5. Tap poll with "NO VOTE" badge
6. **Swipe voting:**
   - See first-time tutorial (if new)
   - Swipe through all options
7. See "YOU'RE SET!" confirmation
8. Tap "SEE RESULTS"
9. View ranked results
10. Return to quest → next poll

### 3.3 Poll Creation Flow
1. From quest detail → "+ NEW POLL"
2. Enter poll name (required)
3. Enter deadline (optional)
4. Tap "Create Poll" (renamed from "NEXT")
5. **Add options screen:**
   - Tap "+ Add Option"
   - Enter name
   - Upload image (optional)
   - Repeat for all options
6. Tap "CREATE"
7. Auto-prompt: "Share this quest?"
8. Return to quest detail (poll added)

---

## 4. Technical Requirements

### 4.1 Platform Support
- **iOS:** 14.0+
- **Android:** API 23+ (Android 6.0)
- **Web (PWA):** Modern browsers (Chrome, Safari, Firefox)

### 4.2 Technology Stack

**Frontend:**
- Framework: Expo (React Native)
- Language: TypeScript
- Navigation: Expo Router (file-based)
- Gestures: react-native-gesture-handler + react-native-reanimated
- State: React Query + Zustand
- UI: Custom components (design system)

**Backend:**
- Platform: Supabase
- Database: PostgreSQL
- Auth: Supabase Auth (email, Google, Apple)
- Storage: Supabase Storage (images)
- Realtime: Supabase Realtime (live results)

**Infrastructure:**
- Hosting: Vercel (web), EAS (mobile)
- CDN: Supabase CDN (images)
- Analytics: PostHog or Mixpanel

### 4.3 Database Schema

```sql
-- Core tables (see full schema in technical appendix)
users (managed by Supabase Auth)
quests (id, name, end_date, invite_code, created_by)
quest_members (quest_id, user_id, joined_at)
polls (id, quest_id, name, deadline, created_by)
poll_options (id, poll_id, name, image_url, created_by)
votes (id, poll_option_id, user_id, vote_type, created_at)
```

**Indexes:**
- `quest_members(user_id)` - fast user quest lookup
- `polls(quest_id)` - fast poll listing
- `votes(poll_option_id, user_id)` - unique constraint + fast lookup

**Row Level Security:**
- Users can only read quests they're members of
- Only quest members can create polls
- Only quest members can vote
- Votes are public within quest

### 4.4 API Endpoints (Supabase Functions)

```typescript
// Core operations via Supabase client
- createQuest(name, end_date) → quest
- joinQuest(invite_code) → membership
- createPoll(quest_id, name, deadline) → poll
- addPollOption(poll_id, name, image) → option
- castVote(option_id, vote_type) → vote
- getPollResults(poll_id) → ranked_results
```

### 4.5 Real-Time Requirements
- Poll results update live when others vote
- New options appear immediately for all users
- Maximum latency: 2 seconds

### 4.6 Performance Requirements
- App launch: < 2 seconds
- Screen transitions: < 300ms
- Swipe response: < 16ms (60fps)
- Image loading: Progressive (blur-up)
- Offline support: View cached data

### 4.7 Security & Privacy
- HTTPS everywhere
- JWT authentication (Supabase)
- No PII in URLs or logs
- Image uploads: virus scanning
- Rate limiting: 100 req/min per user
- GDPR compliance: Data export/deletion

---

## 5. Design Specifications

### 5.1 Visual Design System

**Typography:**
- Primary font: SF Pro (iOS), Roboto (Android), System (Web)
- Styles:
  - Title: 48px, bold (quest/poll names)
  - Headline: 32px, bold (section headers)
  - Body: 16px, regular
  - Caption: 12px, regular (metadata)

**Color Palette:**
- Primary: `#5B6FED` (button blue)
- Success: `#4CAF50` (green - "Works")
- Error: `#FF6B6B` (red - "Doesn't Work")
- Gold: `#FFD93D` (yellow - "Amazing")
- Background: `#F5F5F5` (light gray)
- Surface: `#FFFFFF` (cards)
- Text: `#000000` (primary), `#666666` (secondary)

**Spacing Scale:**
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px

**Border Radius:**
- Buttons: 24px (pill-shaped)
- Cards: 16px
- Images: 12px

**Shadows:**
- Cards: elevation 3
- Buttons: elevation 5 (blue glow)

### 5.2 Component Library

**Buttons:**
- Primary: Blue, white text, full-width
- Secondary: White, blue text, outlined
- Danger: Red, white text (destructive)

**Cards:**
- Quest card: White, shadow, 16px padding
- Poll card: Status badge, tap target
- Vote card: Full-screen, image background, text overlay

**Status Badges:**
- "3/10 ANSWERS": Orange pill
- "RESULTS AVAILABLE": Green pill
- "NO VOTE": Red pill

### 5.3 Animations & Micro-interactions

**Swipe Cards:**
- Entrance: Scale 0.9 → 1.0, opacity 0 → 1 (200ms)
- During swipe: Rotate -15° to +15°, scale 0.95
- Exit: Fly off-screen (direction based on swipe), 300ms ease-out
- Color overlay: Fade in during drag (red/green/gold)

**Buttons:**
- Tap: Scale 0.95, 100ms
- Success: Checkmark animation

**Screen Transitions:**
- Push: Slide from right (300ms)
- Pop: Slide to right (300ms)
- Modal: Fade + scale up (200ms)

### 5.4 Responsive Design
- Mobile: 375px - 428px (primary)
- Tablet: 768px - 1024px (nice to have)
- Desktop: 1280px+ (web only, centered 600px max-width)

---

## 6. Non-Functional Requirements

### 6.1 Usability
- First-time users complete a vote in < 2 minutes (with tutorial)
- 90%+ task success rate on core flows
- Accessibility: WCAG AA compliance
- Support for system dark mode (Phase 2)

### 6.2 Reliability
- 99.5% uptime (backend)
- Zero data loss on votes
- Graceful offline handling
- Auto-retry failed requests (3x with exponential backoff)

### 6.3 Scalability
- Support 1000 concurrent users (Phase 1)
- 100 quests per user
- 50 polls per quest
- 20 options per poll
- Unlimited votes per poll

### 6.4 Localization
- Launch: English only
- Phase 2: Korean, Japanese, Spanish
- RTL support (future)

---

## 7. Development Phases

### Phase 1: MVP (8 weeks)
**Weeks 1-2:** Foundation
- Project setup (Expo + Supabase)
- Authentication flow
- Database schema + RLS policies
- Navigation structure

**Weeks 3-4:** Core Features
- Quest CRUD operations
- Poll CRUD operations
- Swipe voting interface
- Basic results view

**Weeks 5-6:** Polish & Testing
- First-time user onboarding
- Invite/sharing flow
- User testing (4 participants)
- Bug fixes from testing

**Weeks 7-8:** Launch Prep
- Performance optimization
- App store assets
- Beta testing (20 users)
- Launch!

### Phase 2: Enhancements (4 weeks)
- Vote editing/deletion
- Poll templates (common use cases)
- Rich notifications
- Activity feed per quest
- Export results (CSV/PDF)

### Phase 3: Advanced Features (TBD)
- Chat per quest (lightweight)
- Calendar integration
- Reminders for deadlines
- Admin controls (delete options, close polls)
- Anonymous voting mode

---

## 8. Success Criteria & KPIs

### 8.1 Adoption Metrics
- 1000 downloads in first month
- 100 active quests created
- 500 polls voted on
- 20% weekly active users (WAU)

### 8.2 Engagement Metrics
- Average session: 5+ minutes
- Polls per quest: 3+
- Vote completion rate: 80%+
- Return rate (7-day): 70%+

### 8.3 Quality Metrics
- Crash-free rate: 99%+
- Average load time: < 2s
- User rating: 4.5+ stars
- NPS: 40+

### 8.4 User Satisfaction (Survey)
- "Voting felt fun": 85%+ agree
- "Results were fair": 90%+ agree
- "Easier than group chat": 80%+ agree
- "Would recommend": 75%+ yes

---

## 9. Risks & Mitigation

### 9.1 User Adoption Risk
**Risk:** Users don't see value over existing group chats  
**Mitigation:**
- Emphasize speed + fairness in onboarding
- Viral invite mechanism (share wins user attention)
- Network effect: Show "3 friends already using Meet2Go!"

### 9.2 Technical Risk
**Risk:** Swipe gestures feel laggy/unresponsive  
**Mitigation:**
- Use react-native-reanimated (runs on UI thread)
- Test on low-end devices early
- Reduce image sizes aggressively

### 9.3 Competition Risk
**Risk:** Similar apps exist (Doodle, Polly)  
**Mitigation:**
- Differentiate on UX (swipe = fun, not boring forms)
- Emphasize preference strength (not just yes/no)
- Mobile-first (competitors are web-heavy)

### 9.4 Spam/Abuse Risk
**Risk:** Bots create fake votes  
**Mitigation:**
- Require authentication
- Rate limit voting (5 votes/min)
- Quest admin can remove members

---

## 10. Open Questions & Decisions Needed

### 10.1 Terminology
**Question:** Should we rename "Quest" to something clearer?  
**Options:** "Trip", "Group", "Event", "Plan"  
**Decision:** A/B test in onboarding  
**Owner:** Product team

### 10.2 Vote Privacy
**Question:** Should votes be anonymous or public?  
**Current:** Public (builds trust, transparency)  
**Alternative:** Anonymous mode (less social pressure)  
**Decision:** Public for MVP, anonymous mode in Phase 2  
**Owner:** Product team

### 10.3 Monetization (Future)
**Question:** How will we monetize?  
**Options:**
- Freemium (5 quests free, unlimited paid)
- Pro features (poll templates, analytics)
- B2B (event planning companies)
**Decision:** Defer until 10K users  
**Owner:** Business team

### 10.4 Web vs Mobile First
**Question:** Should we prioritize web or mobile launch?  
**Current:** Mobile-first (swipes work better)  
**Decision:** Launch mobile, then PWA 2 weeks later  
**Owner:** Engineering team

---

## 11. Appendices

### 11.1 User Testing Insights Summary
Based on 4 participants (P1-P4), ages 21-23:

**High Priority Fixes:**
- ✅ Add consistent home button
- ✅ Clarify Quest vs Poll terminology
- ✅ Fix keyboard blocking issue
- ✅ Visual feedback during swipes

**Medium Priority:**
- ✅ Show member list per quest
- ✅ Better vote breakdown display
- ⚠️ Rename "expiry date" → "trip end date"

**Low Priority:**
- ✅ Improve button labels ("NEXT" → "Create")
- ✅ Fix duplicate quest bug
- ✅ Enable link sharing button

### 11.2 Competitive Analysis
- **Doodle:** Scheduling focus, web-heavy, no preference strength
- **Polly:** Slack integration, simple yes/no polls
- **StrawPoll:** Anonymous voting, no group context
- **Our Advantage:** Mobile-first, swipe UX, preference strength, trip context

### 11.3 Future Feature Backlog
- Dark mode
- Ranked-choice voting (advanced algorithm)
- Integration with Google Calendar
- WhatsApp/iMessage bot
- AI-suggested options based on location/context
- Split payment calculator (who owes what)

---

## 12. Approval & Sign-off

**Document Owner:** Product Manager  
**Last Reviewed:** November 3, 2025  
**Next Review:** December 1, 2025

**Stakeholder Approvals:**
- [ ] Product Manager
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] Business Owner

**Ready for Development:** ✅ Yes

---

*This PRD is a living document and will be updated as we learn from user feedback and development progress.*