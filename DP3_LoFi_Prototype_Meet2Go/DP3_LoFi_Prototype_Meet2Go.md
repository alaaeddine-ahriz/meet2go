# DP#3 – LoFi Prototype

Due date: October 30, 2025
Course: CS473 Introduction to Social Computing
Done: No

# **Problem Statement**

Friend groups struggle to make collective decisions because discussions in group chats quickly become chaotic and fail to capture the strength and fairness of individual preferences.

# **Tasks**

### Create a group (“Quest”) & Start a poll

Users can create dedicated group spaces (e.g. 'Trip to Busan', 'Night Out') and invite friends. They can launch a 'Quest' to serve as a central hub for collaboration, naming it and generating an invite link to share so that all decisions can be made in one place. Within each quest, users can create polls to decide on questions such as 'Where should we eat?' or 'Which day works?', adding options and inviting friends to vote, thereby keeping every discussion organised and minimising confusion.

### **Swipe/Press to vote**

Users swipe left, right, or up to show how strongly they feel about each option. **Users can** express both their acceptance and the strength of their preferences through an engaging, inclusive, and efficient process. Voting feels fun and effortless thanks to a swipe-based interface that turns decision-making into a quick, playful activity for everyone. 
*During testing, users preferred this intuitive swiping motion over the alternative “hold-to-indicate” method, which felt clunky and less natural.*

### **View results together**

Users see a ranked list of the group’s preferences once voting is complete. This highlights where consensus is strongest and helps everyone agree quickly. **Users can** see results instantly as the app automatically tallies weighted votes and presents them in a clear, visual summary — helping the group make quick, confident decisions and move forward together.

# **Prototype**

### Summary description

This tool is designed to help groups coordinate shared plans, such as trips, dinners or activities, efficiently by simplifying the decision-making process. Through a swipe-based voting interface, users can indicate how much they like each option, and the system aggregates these weighted preferences to reach a fair consensus. The user-friendly design focuses on engagement and transparency, enabling users to swiftly create polls, contribute ideas and view results in a centralised hub. By streamlining communication and reducing confusion in group chats, the platform helps users reach satisfying decisions faster so they can enjoy more meaningful shared experiences.

**Link to Prototype →** [https://www.figma.com/proto/gJSLjpZgvU5TkcgtgKRUlF/Meet2Go?node-id=109-3486&t=pADDYYqzFWOUbzxe-1](https://www.figma.com/proto/gJSLjpZgvU5TkcgtgKRUlF/Meet2Go?node-id=109-3486&t=pADDYYqzFWOUbzxe-1)

### Task 1

**Design choices**

To create a group, the user can press the '+ New Quest' button on the home screen. Here, they can also see the existing groups/'quests' that they are part of. After pressing the button, the user can create the ‘Quest’. A name and expiry date must be entered here. These are predetermined in the prototype. Once this has been done, the 'Quest' is created and the user can add polls and invite friends via a link. To create a poll, the user must press the 'Create poll' button and add a name and an optional deadline. They can then add options. The name, deadline and all options that can be edited are predetermined in the prototype. Each option that the user adds will count as a vote for it with Amazing. A picture will also be added automatically to minimise the effort required to create a poll. Once the user has finished adding options, they are prompted to share the 'Quest' they are currently in to make it as easy as possible. 

**Instructions** 

- Press the '+ New Quest' button to start creating a Group/'Quest'
- Enter a name and an expiry date for the 'Quest'
- After this press the '+ New Poll' button to start to create a poll
- Enter a name and, optional, a deadline and possible options. Finally, swipe down to remove the keyboard and finish creating the poll.
- Then, to share the 'Quest', copy the link by clicking the share button. Alternatively, go back to the 'Quest' screen and click the 'Share' button at the bottom left.

**Screenshots**

![Main (1).png](/images/Main_(1).png) ![Quest – Busan Trip (1).png](/images/Quest__Busan_Trip_(1).png) ![New Poll – Step 21.png](/images/New_Poll__Step_21.png) ![New Poll – Step 27 (1).png](/images/New_Poll__Step_27_(1).png)

### Task 2

**Design choices**

To vote in a poll, the user can go to the desired 'Quest' and vote for the desired activity. In this case, we have implemented the 'Japan Trip' and the 'Monday Activity'. This is enough for simplicity's sake. In the 'Monday Activity' poll, there are three options to vote on, showcasing the three ways a person can vote. We pre-filled these. The first option is a hike, which can be swiped to the right to indicate that it works. The second option can be swiped left for 'doesn't work', and the third option can be swiped up for 'amazing'. We chose these three options because a simple yes or no is often not enough. Maybe you are fine with this option, but it's not your favourite. Normally, you would have to decide between 'yes' and 'no'. Here, you can just swipe to say it works, and give things you really like an 'Amazing'.
Once the user has voted, new options can be added to the poll and the results can be viewed. The new options that can be added are also pre-filled.

**Instructions** 

- Go to the Japan trip page and click on 'Monday activity'.
- Swipe right for the first vote, left for the second and up for the third.

**Screenshots**

![Quest – Busan Trip (2).png](/images/Quest__Busan_Trip_(2).png) ![Vote 6 (1).png](/images/Vote_6_(1).png)

### Task 3

**Design choices**

Once the user has voted, they can see the result by clicking on the 'See result' button or going back to the 'Quest' page and clicking on the poll again (last one not implemented). We made it so that the user can only see the result after they have voted, to ensure an unbiased standpoint is taken while voting, and to provide an incentive to complete the poll. On the results screen, the different options can be clicked to see how many people voted for each option and how intensely they voted for it, to get a better overview of group preferences.

**Instructions** 

- After voting for the 'Monday Activity', click the 'See Results' button.
- For further details, click on the hike and press the blue buttons to switch between the preferences.

**Screenshots**

![Vote 10.png](/images/Vote_10.png) ![Vote 12 (1).png](/images/Vote_12_(1).png) ![Vote results per person.png](/images/Vote_results_per_person.png)

# **Observations from User-testing**

### **Participants**

We conducted usability testing with **four participants** (P1–P4), all university students aged between **21 and 23**.

- P1: Student from Germany, 21
- P2: Exchange student, 21
- P3: Full-time student, 23
- P4: Full-time student, 21

### **1) Understanding Core Concepts**

1. **Difference between “Quest” and “Poll” unclear** (P1, P2, P4) - **High**
    
    *Plan:* Add onboarding tutorial explaining "Quest" = group/trip container, "Poll" = individual decision within quest. Rename "Quest" to "Trip" or "Group" for clarity.
    
2. **Purpose of group expiry date confusing** (P2, P3) - **Medium**
    
    *Plan:* Replace “expiry date” with clearer “trip end date” or “voting deadline.” or give the option to  remove it entirely.
    
3. **Meaning of “NEXT” when creating quest unclear** (P4) - **Low**
    
    *Plan:* Replace "NEXT" with more descriptive text like "Create Quest" or "Continue to Quest".
    
4. **Users unsure what "Cool" and "Agree" gestures mean** (P4) - **Medium**
    
    *Plan:* Added visual labels/feedback (overlay color) that appear while swiping to clarify gesture meanings.

### **2) Navigation & Layout**

1. **No home button / inconsistent presence** (P1, P4) - **High** 
    
    *Plan: Fixed*
    
2. **Unclear where past quests are stored** (P4) - **Medium**
    
    *Plan:*  Add “History” or “Archived Quests” section.
    
3. **“See Results” button felt like only way back** (P2) - **Low** 
    
    *Plan: Cleared up the interface by removing the button and adding a Previous button.* 
    

### **3) Interaction Design**

1. **Keyboard blocks view after 4th option, hard to proceed** (P1, P2) - **High**
    
    *Plan:* *Let the keyboard disappear by clicking anywhere on the screen.*
    
2. **Swipe gestures not intuitive (but learnable)** (P3, P4) - **Medium**
    
    *Plan:* Provide quick visual hints (e.g., arrow indicators) during first use. (maybe)
    

### **5) Content & Data**

1. **Member list for a trip missing** (P3) - **Medium**
    
    *Plan:* Add “Participants” section for each quest/trip.
    
2. **Trip duplication bug (Japan → Busan)** (P3) - **Low**
    
    *Plan: fixed*
    
3. **Link button when creating quest does not work** (P1) - **Low** 
    
    *Plan: fixed*
    
4. **Hike resolution not good/intuitive** (P1) - **Medium** 
    
    *Plan: This was fixed by displaying, for each of the voting options (Does Not Work, Works, Amazing), who voted for which.*
    

---

**P1, Student from Germany, 21**

- Add expiration date unclear
- Thought creating a quest was already a poll
- The keyboard gets in the way after option 4. It's not intuitive how to proceed. Swiping down is not intuitive.
- Desgin too white
- Hike resolution not good/intuitive (fixed)
- No home button (fixed)
- Prefers swiping for larger groups
- Link button when creating quest does not work (fixed)

**P2, exchange student, 21**

- Difference between quest and poll not clear at the beginning
- Why does a “group” have an expiry date? Why is the group then deleted?
- The keyboard gets in the way after option 4. It's not intuitive how to proceed. Swiping down is not intuitive.
- “See results” button when adding options is the only way back, unclear. (fixed)
- Prefers swiping over long press.

**P3, full-time student, 23**

- The swipe functions are not intuitive, but learnable
- The function of voting does not imply interaction
- List of all members of the trip is not available
- The deadline for a trip doesn't make sense, maybe date of the trip?
- When coping Japan Trip, it becomes Busan trip for a second

**P4, full-time student, 21**

- Where do names in the result comes from?
- Can not really differentiate poll and quest
- How "Cool" (swipe-up) and "Agree" (swipe-right) are different?
- The fact that home button is absent on half of the frames discomforts user
- Wondering, where past quests are stored
- When creating a quest, what does “NEXT” stands for?
