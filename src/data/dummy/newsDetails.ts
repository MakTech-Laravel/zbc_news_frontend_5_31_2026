import { homeImages } from "@/lib/homeImages";

export const newsDetailArticle = {
  category: "Sports",
  title:
    "Champions League Final: Real Madrid vs. Manchester City Set for Wembley Showdown",
  subtitle:
    "Europe's elite clubs prepare for a historic night under the London lights as millions tune in worldwide.",
  imageUrl: homeImages.heroSports,
  imageAlt: "Wembley Stadium lit up at night ahead of the Champions League final",
  author: {
    name: "James Whitfield",
    role: "Sports Correspondent",
    initials: "JW",
  },
  publishedAt: "May 6, 2026",
  readTime: "3 min read",
  commentCount: 7204,
  body: [
    "London is bracing for one of the most anticipated nights in European football as Real Madrid and Manchester City confirm their place in the Champions League final at Wembley Stadium. Ticket demand has shattered previous records, with hospitality packages selling out within hours of the semi-final whistle.",
    "Managers from both sides addressed the media on Tuesday, emphasizing tactical discipline and squad depth after grueling domestic campaigns. City will lean on their high press and positional play, while Madrid's experience in knockout football remains their greatest asset on the biggest stage.",
    "UEFA confirmed enhanced security measures across London, with travel advisories issued for supporters arriving from Spain and the United Kingdom. Fan zones in Trafalgar Square and Wembley Park will open six hours before kickoff, featuring live music, food vendors, and big-screen broadcasts for ticketless supporters.",
    "Broadcasters expect global viewership to exceed 400 million, with streaming partners rolling out multilingual commentary feeds and interactive match statistics. Sponsors have lined the stadium perimeter with digital displays that will cycle through player milestones throughout the evening.",
    "Analysts predict a tight affair decided by individual brilliance rather than open play, with both squads capable of controlling tempo for long stretches. Whichever side adapts faster to Wembley's wide pitch and late-evening conditions may lift the trophy when the final whistle blows.",
  ],
} as const;
