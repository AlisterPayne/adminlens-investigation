import type { StaticImageData } from "next/image";

import Image01 from "@/public/images/user-64-01.jpg";
import Image02 from "@/public/images/user-64-02.jpg";
import Image03 from "@/public/images/user-64-03.jpg";
import Image04 from "@/public/images/user-64-04.jpg";
import Image05 from "@/public/images/user-64-05.jpg";
import Image06 from "@/public/images/user-64-06.jpg";
import Image07 from "@/public/images/user-64-07.jpg";
import Image08 from "@/public/images/user-64-08.jpg";
import Image09 from "@/public/images/user-64-09.jpg";
import Image10 from "@/public/images/user-64-10.jpg";
import Image11 from "@/public/images/user-64-11.jpg";
import Image12 from "@/public/images/user-64-12.jpg";

export interface User {
  id: number;
  name: string;
  image: StaticImageData;
  link: string;
  location: string;
  content: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
}

const bio = "Fitness Fanatic, Design Enthusiast, Mentor, Meetup Organizer & PHP Lover.";
const profileLink = "/community/profile";

export const users: User[] = [
  {
    id: 0,
    name: "Dominik McNeail",
    image: Image01,
    link: profileLink,
    location: "🇮🇹",
    content: bio,
    email: "dominik.mcneail@acme.com",
    role: "Administrator",
    status: "Active",
  },
  {
    id: 1,
    name: "Ivan Mesaros",
    image: Image02,
    link: profileLink,
    location: "🇫🇷",
    content: bio,
    email: "ivan.mesaros@acme.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: 2,
    name: "Tisha Yanchev",
    image: Image03,
    link: profileLink,
    location: "🇩🇪",
    content: bio,
    email: "tisha.yanchev@acme.com",
    role: "Editor",
    status: "Pending",
  },
  {
    id: 3,
    name: "Sergio Gonnelli",
    image: Image04,
    link: profileLink,
    location: "🇮🇹",
    content: bio,
    email: "sergio.gonnelli@acme.com",
    role: "Viewer",
    status: "Active",
  },
  {
    id: 4,
    name: "Jerzy Wierzy",
    image: Image05,
    link: profileLink,
    location: "🇪🇸",
    content: bio,
    email: "jerzy.wierzy@acme.com",
    role: "Viewer",
    status: "Inactive",
  },
  {
    id: 5,
    name: "Mirko Grubisic",
    image: Image06,
    link: profileLink,
    location: "🇩🇪",
    content: bio,
    email: "mirko.grubisic@acme.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: 6,
    name: "Alisha Acharya",
    image: Image07,
    link: profileLink,
    location: "🇬🇧",
    content: bio,
    email: "alisha.acharya@acme.com",
    role: "Administrator",
    status: "Active",
  },
  {
    id: 7,
    name: "Brian Halligan",
    image: Image08,
    link: profileLink,
    location: "🇺🇸",
    content: bio,
    email: "brian.halligan@acme.com",
    role: "Viewer",
    status: "Pending",
  },
  {
    id: 8,
    name: "Patricia Semklo",
    image: Image09,
    link: profileLink,
    location: "🇮🇳",
    content: bio,
    email: "patricia.semklo@acme.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: 9,
    name: "Maria Martinez",
    image: Image10,
    link: profileLink,
    location: "🇮🇹",
    content: bio,
    email: "maria.martinez@acme.com",
    role: "Viewer",
    status: "Inactive",
  },
  {
    id: 10,
    name: "Vedad Siljak",
    image: Image11,
    link: profileLink,
    location: "🇨🇦",
    content: bio,
    email: "vedad.siljak@acme.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: 11,
    name: "Dominik Lamakani",
    image: Image12,
    link: profileLink,
    location: "🇧🇪",
    content: bio,
    email: "dominik.lamakani@acme.com",
    role: "Administrator",
    status: "Active",
  },
];

export function getUserById(id: number): User | undefined {
  return users.find((user) => user.id === id);
}
