# 🧵 Sticho Partner Dashboard - Product Specification & Implementation

A professional, mobile-responsive operational home base for solo tailors running their business through the Sticho marketplace. This is designed as a high-utility tool for daily business management, focusing on money, trust, and operational efficiency.

## 🎨 Visual Design System: "Classic Minimal"
The dashboard follows a precise, uncluttered design language to evoke professionalism and trust.

- **Core Palette**: 
  - `Primary Green (#1E5631)`: Action-oriented, representing the tailoring craft.
  - `Brass Gold (#C98A3E)`: Used for money, growth nudges, and premium features.
  - `Canvas (#F7F6F3)`: Soft background to reduce eye strain during long workdays.
- **Typography**: Tabular numerals for all financial data to ensure perfect column alignment.
- **UX Philosophy**: "Interruption-Aware" design. Critical actions (updating order stages, accepting quotes) are accessible within two taps, assuming the user is managing the app between customers at a shop counter.

---

## 🚀 Key Feature Modules

### 1. Operational Pipeline (Lead $\rightarrow$ Quote $\rightarrow$ Order)
Moves beyond a simple CRM to a real marketplace transaction flow.
- **Lead Management**: Track inquiries from the marketplace with status filtering (`New`, `Contacted`, `Quoted`, `Converted`).
- **Professional Quote Builder**: 
  - **Quick Templates**: Pre-filled common services (e.g., "Standard Shirt") to reduce friction.
  - **Dynamic Line Items**: Custom descriptions and pricing per garment.
  - **Delivery Commitment**: Integrated estimated delivery date picker.
- **Tailoring-Specific Order Tracking**: A precise 7-stage lifecycle:
  `Accepted` $\rightarrow$ `Measurements Pending` $\rightarrow$ `In Stitching` $\rightarrow$ `Ready for Fitting` $\rightarrow$ `Ready for Delivery` $\rightarrow$ `Delivered` $\rightarrow$ `Completed`.

### 2. Financial Trust & Payouts
Designed to remove anxiety around payments and platform fees.
- **Money-First Dashboard**: KPIs prioritize "Today's Earnings" and "Pending Payouts."
- **Transparent Math**: Detailed breakdown of `Gross Earnings` $\rightarrow$ `Platform Commission` $\rightarrow$ `Net Payable`.
- **Payout Ledger**: Full history of transfers with reference IDs and status tracking (`Paid`, `Processing`, `Failed`).
- **Bank Management**: Secure interface for managing payout account details.

### 3. Trust, Reputation & Compliance
Solves the "cold-start" problem for new tailors.
- **Verification Checklist**: Step-by-step verification for Phone, Identity, Address, and Bank details to earn trust badges.
- **Reputation Hub**: Publicly respond to customer reviews and track aggregate star ratings.
- **Dispute Center**: A professional case-management system for handling complaints (e.g., "Wrong Fit") with evidence upload and resolution tracking.
- **Account Standing**: A non-punitive indicator (`Good Standing`, `Attention Needed`) reflecting platform health.

### 4. Growth & Visibility Analytics
Turns data into actionable business advice.
- **Conversion Funnel**: Visualizes the drop-off from `Lead` $\rightarrow$ `Quote` $\rightarrow$ `Order` to identify business bottlenecks.
- **Visibility Score**: A percentage-based score showing marketplace discoverability.
- **Actionable Nudges**: Specific tips to increase score (e.g., "Add 5+ portfolio photos to get 3x more leads").
- **Monetization Seam**: A "Coming Soon" teaser for paid featured placements (Boosts).

### 5. Shop Management Tools
- **Measurement Profiles**: Saved customer measurements attached to repeat clients, eliminating redundant data entry.
- **Capacity Control**: "Accepting New Orders" toggle and "Max Active Orders" cap to prevent overcommitment.
- **Notification Center**: Granular control over push/SMS alerts to manage interruptions during work hours.

---

## 🛠 Technical Implementation
- **Framework**: Next.js (App Router)
- **Styling**: CSS Modules with a centralized Design Token system in `globals.css`.
- **Components**: Atomic UI library (`Button`, `Card`, `StatusChip`, `EmptyState`).
- **Responsiveness**: Mobile-first approach with a collapsible sidebar and adaptive grids.
