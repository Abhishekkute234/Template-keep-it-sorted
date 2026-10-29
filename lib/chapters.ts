export type Chapter = {
  id: string;
  numeral: string;
  label: string;
  z: number;
  cam: [number, number, number];
  look: [number, number];
  /** Fraction of screen width the 3D content is pushed right on wide screens, leaving room for the copy column. */
  frame: number;
  lines: string[];
};

export const chapters: Chapter[] = [
  {
    id: "prologue",
    numeral: "0",
    label: "Prologue",
    z: 0,
    cam: [0, 0.4, 11],
    look: [0, 0.6],
    frame: 0,
    lines: [
      "Hi! I'm PIXEL, your narrator. Scroll down and I'll tell you a story.",
      "Fun fact: I was designed with a UI kit from this very website. Very meta.",
    ],
  },
  {
    id: "problem",
    numeral: "I",
    label: "The Problem",
    z: -34,
    cam: [-1.2, 0.2, 10],
    look: [0, 0],
    frame: 0.17,
    lines: ["Yikes. Look at this mess. Hover the words to fix them!", "Somebody used Comic Sans in production. I need a minute."],
  },
  {
    id: "categories",
    numeral: "II",
    label: "Category Constellation",
    z: -70,
    cam: [0, 0.9, 9],
    look: [0, -0.3],
    frame: 0.18,
    lines: ["Ten galaxies of goodies. Click a monolith to warp inside.", "Pro tip: the UI Kits monolith is load-bearing. Don't tell it."],
  },
  {
    id: "trending",
    numeral: "III",
    label: "Trending Gallery",
    z: -108,
    cam: [0, 0.2, 9.6],
    look: [0, -0.5],
    frame: 0.18,
    lines: ["These sell like hot pixels. Click one to take a closer look.", "Everyone in this gallery is somebody's 'I built this myself'."],
  },
  {
    id: "creators",
    numeral: "IV",
    label: "Creators' Archipelago",
    z: -146,
    cam: [1.2, 1.4, 10.5],
    look: [0, -0.2],
    frame: 0.17,
    lines: ["Meet the creators! Each planet is a human who skipped lunch for you.", "Click a planet to see everything its creator made."],
  },
  {
    id: "access",
    numeral: "V",
    label: "The Infinite Key",
    z: -182,
    cam: [2.6, 0.3, 9.5],
    look: [2.6, 0.1],
    frame: 0,
    lines: ["Behold: the Infinite Key. Click it. Spin it. Feel powerful.", "One key, every door. Except the fridge. We tried."],
  },
  {
    id: "reviews",
    numeral: "VI",
    label: "Word of Mouth",
    z: -216,
    cam: [-1, 0.6, 10.5],
    look: [0, 0.2],
    frame: 0.17,
    lines: ["I wrote none of these reviews. Probably.", "Five stars. I'd give six, but the design system won't allow it."],
  },
  {
    id: "epilogue",
    numeral: "VII",
    label: "The Portal",
    z: -252,
    cam: [0, 0.2, 12.5],
    look: [0, 0.2],
    frame: 0,
    lines: ["The portal to the shop awaits. Click it. Snacks not included.", "Thanks for scrolling with me. You're my favorite human today."],
  },
];

export const jokes = [
  "Why did the designer break up with the grid? Too many boundaries.",
  "I asked for a raise. They gave me a bigger border-radius.",
  "There are 10 kinds of designers: those who use 8pt grids, and those who will.",
  "Lorem ipsum dolor sit... sorry, old habit.",
  "My favorite font is Helvetica. My second favorite is also Helvetica.",
  "I tried to center a div once. I've been in therapy since.",
  "Dark mode isn't a feature. It's a lifestyle.",
  "Never trust an atom. They make up everything. Like 'final_v2.fig'.",
];
