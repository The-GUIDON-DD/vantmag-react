import type { CategoryDetails } from "./app/types";

export const categories = [
  {
    id: 13,
    title: "TV & FILM",
    path: "/category/tv-and-film",
    icon: "/icons/chip/tv-and-film.svg",
    color: "#ef3e68",
  },
  {
    id: 12,
    title: "FOOD",
    path: "/category/food",
    icon: "/icons/chip/food.svg",
    color: "#f9a524",
  },
  {
    id: 11,
    title: "THEATER & ARTS",
    path: "/category/theater-and-the-arts",
    icon: "/icons/chip/theater-and-the-arts.svg",
    color: "#755489",
  },
  {
    id: 4,
    title: "MUSIC",
    path: "/category/music",
    icon: "/icons/chip/music.svg",
    color: "#b5c932",
  },
  {
    id: 243,
    title: "HYPE",
    path: "/category/hype",
    icon: "/icons/chip/hype.svg",
    color: "#d63ba3",
  },
  {
    id: 242,
    title: "HUB",
    path: "/category/hub",
    icon: "/icons/chip/hub.svg",
    color: "#3dbb95",
  },
  {
    id: 244,
    title: "EXPOSÉ",
    path: "/category/expose",
    icon: "/icons/chip/expose.svg",
    color: "#f6B50b",
  },
];

export const page_size_values = {
  PAGE_SIZE: 9,
  MORE_PAGE_SIZE: 6,
};

export const categoryDetails: Record<string, CategoryDetails> = {
  expose: {
    name: "Exposé",
    description:
      "As persons for and with others, we simply can’t forget what’s happening in the world today.",
    descriptionColor: "#FCF0CD",
  },
  food: {
    name: "Food",
    description:
      "From the bistros of Katipunan to the hole-in-the-wall joints along Maginhawa, there’s something for every foodie on this side of the culinary scene.",
    descriptionColor: "#FEECD3",
  },
  hub: {
    name: "Hub",
    description:
      "Take a glimpse at Ateneo’s vibrant campus culture! In this beat, we focus on the heart of the university—its students.",
    descriptionColor: "#D8F1E9",
  },
  hype: {
    name: "Hype",
    description:
      "We bring you the latest and the greatest trends in pop culture from an Atenean lens.",
    descriptionColor: "#F7D8EC",
  },
  music: {
    name: "Music",
    description:
      "Whether it be a gig at Mow’s Bar or an open mic event at Areté, the Atenean music scene resounds loudly and proudly. Brimming with talent in genres of every kind, there’s something for every music fan.",
    descriptionColor: "#F0F4D6",
  },
  "theater-and-the-arts": {
    name: "Theater & Arts",
    description:
      "Everything from literature and theater to the fine arts; we take you to the stages and pages of the best offerings from artists.",
    descriptionColor: "#E3DDE6",
  },
  "tv-and-film": {
    name: "TV & Film",
    description:
      "From the small screen to the big, we explore the world of film—from the best of Philippine cinema to the international scene.",
    descriptionColor: "#FCD8E0",
  },
};

export type CategoryData = (typeof categories)[number] & CategoryDetails;
