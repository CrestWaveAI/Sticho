# SCRUM-14: Save / Shortlist Tailors

## Jira Scrum Ticket Details
- **Title:** Save / Shortlist Tailors
- **Summary:** As a customer, you can bookmark tailors you are interested in, allowing you to compare and revisit them later without the need to re-search.
- **Description:** 
  * Given a logged-in customer, when they tap "Save" on a tailor card or profile, the tailor is added to their shortlist.
  * Given a saved tailor, when "Save" is tapped again, the tailor is removed from the shortlist.
  * Given a returning session, when the customer opens "My Shortlist", previously saved tailors persist and display.
- **Assigned To:** Jeelan Basha (@jeelan80)
- **Date Assigned:** June 19, 2026
- **Date PR Raised:** June 29, 2026

## Actual Implemented Details

1. **Shortlist State & Persistence ([page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/page.tsx)):**
   - Created `shortlistedIds` array state to store bookmarked tailor IDs.
   - Synchronized shortlisted IDs to client-side local storage under key `"shortlisted_tailors"`.
   - Populated the shortlist IDs asynchronously inside a mount `useEffect` (with `setTimeout`) to comply with ESLint constraints preventing synchronous state transitions during mounts.
   - Added `toggleShortlist` state helper inside `useCallback` to toggle bookmarks on and off.

2. **Shortlist Filtering and Custom Results Header ([page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/page.tsx)):**
   - Added `showOnlyShortlist` boolean toggle state.
   - Updated the main `loadTailors` lifecycle hook to filter listings client-side by shortlist IDs when the view is active.
   - Customized the page count header (`results-count`) to display *"Showing X saved tailor(s) in shortlist"* when shortlists are filtered.

3. **Bookmark Button & Header Badges ([page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/page.tsx)):**
   - Replaced plain "Explore Tailors" anchor links in the header navigation with structured toggle buttons.
   - Appended a glowing pink count badge (`shortlist-badge`) to the "My Shortlist" navigation tab to track bookmark volume in real-time.
   - Embedded absolute-positioned heart buttons on every card wrapper inside the listings grid.

4. **Empty Shortlist State ([page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/page.tsx)):**
   - Designed a descriptive "Your Shortlist is Empty" fallback interface with custom copy and a CTA button to browse all tailors if the user views their shortlist with zero saved entries.

5. **Style Framework and Micro-Animations ([globals.css](file:///h:/Projects/Stichoh/frontend/src/app/globals.css)):**
   - Added `.bookmark-btn` glassmorphic overlay styling (`background: rgba(15, 15, 18, 0.4)`, `backdrop-filter: blur(8px)`, smooth transitions).
   - Added heart pop keyframe animations (`heartPop`) triggering scale transformations upon bookmark activations.
   - Documented custom scaling and pop-in keyframes (`popIn`, `scaleIn`) for badges and sticky buttons.
