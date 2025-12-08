# DP#5 – Final Report

**Team:** Meet2Go

## Project Summary

**Problem:** Friend groups often fail to make collective decisions efficiently because group chat discussions are chaotic, fragmented, and fail to capture the nuance of individual preferences.

**Solution:** Meet2Go is a mobile-first decision-making app that transforms tedious planning into a fun, swipe-based game where users express preference strength on options to reach a fair consensus.

**Unique Approach:** Using a Tinder-style swipe interface to capture weighted preferences ("Doesn't Work", "Works", "Amazing"), making the process engaging while ensuring the final decision truly reflects the group's collective happiness.

## Representative Screenshots

Include a few most important screenshots that showcase the uniqueness of your application. Add callouts, annotations, or captions.

![Swipe Interface](images/placeholder_swipe.png)
*Figure 1: The core swipe interface allowing users to express preference intensity (Amazing, Works, Doesn't Work).*

![Results and Consensus](images/placeholder_results.png)
*Figure 2: The consensus view showing the winning option and weighted happiness score.*

![Quest Creation](images/placeholder_quest.png)
*Figure 3: Creating a new quest and adding options with AI-generated visuals.*

## Quality Arguments

*(Max. 300 words)*

Meet2Go delivers a "great" user interface by fundamentally redesigning the social chore of group coordination into a playful, engaging interaction.

**1. Transforming "Work" into "Play" (Incentives):**
Traditional scheduling tools feel administrative. Meet2Go’s swipe-based interactions (inspired by social apps) leverage familiar, low-friction gestures to lower the barrier to participation. The immediate visual feedback (card color changes) satisfy the user’s need for responsiveness, making the act of voting feel like a game rather than a survey.

**2. Capturing Nuance via Simple UI:**
A key quality of the interface is its ability to capture complex social data—preference intensity—without complex controls. The decision to use a 3-way swipe (Left/Right/Up) is a novel UI component that maps intuitively to human feelings ("Doesn't Work", "Works", "Amazing!"). This supports the expected social interaction by preventing the "lukewarm consensus" problem where groups settle for the option everyone "tolerates" but nobody "likes."

**3. Visual Polish and Responsiveness:**
The application uses React Native Reanimated to ensure smooth animations, which is critical for the tactile feel of the cards. The use of AI-generated images for every option ensures that even a text-based suggestion feels visual and engaging, enhancing the "window shopping" experience of picking a restaurant or activity.

## Deployment Summary

*(Max. 300 words)*

*How did your deployment go? Report the number of users, feedback from users, analysis, etc. Use visual aids.*

**Deployment Stats:**
*   **Total Users:** [Number]
*   **Total Quests Created:** [Number]
*   **Total Votes Cast:** [Number]

**User Feedback Analysis:**
(Summarize feedback here)

![Deployment Chart](images/placeholder_chart.png)
*Figure 4: Chart showing user engagement or voting patterns.*

## Discussion

*(Max. 500 words)*

**Incentives for Participation:**
One of the core challenges in social computing is the "free rider" problem in collective action—everyone wants a plan, but nobody wants to plan it. Meet2Go addresses this by misaligning the cost of participation (low: just swipe) with the reward (high: a great group activity). By gamifying the input mechanism, we provide an intrinsic incentive to participate. The interface itself is the "sugar" that helps the "medicine" of decision-making go down.

**Supporting Social Interaction & Conflict Resolution:**
Social coordination is often hindered by the fear of social friction. In group chats, suggesting an idea can feel risky ("What if they hate it?"). Meet2Go decouples the suggestion from the judgment. Votes are aggregated, and while transparency is available, the primary view is the *consensus*, which shifts the focus from "User A vs. User B" to "Group vs. The Problem." This design supports pro-social interaction by bringing the group to a mathematical consensus that feels fair, rather than a political one dominated by the loudest voice.

**Quality Control & AI:**
We integrated generative AI to visually represent options. This acts as a quality control mechanism for the *content* of the poll. A bare text option "Pizza" is less engaging than "Pizza" with an image that smells melted cheese. This ensures that all options are presented on an equal visual footing, reducing bias based on how well a user described their suggestion.

**Privacy & Ethics:**
We considered the privacy implications of "preference intensity." While users can see who voted for what to ensure trust (transparency), we deliberately avoided negative reinforcement mechanics (e.g., "downvoting" a person's idea). The "Doesn't Work" swipe is framed as a logistical constraint rather than a personal rejection, protecting the social fabric of the group.

## Prototype & Repository

*   **Live Prototype:** https://meet2go.vercel.app/
*   **Repository:** https://github.com/alaaeddineahriz/meet2go

## Individual Reflections
