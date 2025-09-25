"use server";

import { unstable_cache } from "next/cache";
import { db } from "../db";

export const getUserCourses = unstable_cache(
  async (userId: string) => {
    return db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        courses: true,
      },
    });
  },
  ["user-courses"],
  {
    revalidate: 60 * 10,
    tags: ["user-courses"],
  },
);

export const getCourses = unstable_cache(
  async () => {
    return db.course.findMany();
  },
  ["courses"],
  {
    revalidate: 60 * 10,
    tags: ["courses"],
  },
);

export const getScholarships = unstable_cache(
  async () => {
    return db.scholarship.findMany();
  },
  ["scholarships"],
  {
    revalidate: 60 * 10,
    tags: ["scholarships"],
  },
);

export const getAnnoucements = unstable_cache(
  async () => {
    return db.announcement.findMany();
  },
  ["annoucements"],
  {
    revalidate: 60 * 10,
    tags: ["annoucements"],
  },
);

export const getUserEvents = unstable_cache(
  async (userId: string) => {
    const userWithCourses = await db.user.findUnique({
      where: { id: userId },
      select: { courses: { select: { id: true } } },
    });
    const userCourseIds = userWithCourses?.courses.map((c) => c.id) ?? [];

    return db.event.findMany({
      where: {
        OR: [
          { userId: null, courseId: null }, // Global events
          { userId }, // User's personal events
          { courseId: { in: userCourseIds } }, // Events for user's courses
        ],
      },
      include: {
        createdBy: { select: { name: true, image: true } },
        course: { select: { title: true, classCode: true } },
      },
      orderBy: { start: "asc" },
    });
  },
  ["user-events"],
  {
    revalidate: 60 * 10,
    tags: ["user-events"],
  },
);

export const getEvents = unstable_cache(
  async () => {
    return db.event.findMany({
      include: {
        createdBy: { select: { name: true, image: true } },
        course: { select: { title: true, classCode: true } },
      },
      orderBy: { start: "asc" },
    });
  },
  ["events"],
  {
    revalidate: 60 * 10,
    tags: ["events"],
  },
);

export const getGlobalEvents = unstable_cache(
  async () => {
    return db.event.findMany({
      where: { userId: null, courseId: null },
      include: {
        createdBy: { select: { name: true, image: true } },
        course: { select: { title: true, classCode: true } },
      },
      orderBy: { start: "asc" },
    });
  },
  ["global-events"],
  {
    revalidate: 60 * 10,
    tags: ["global-events"],
  },
);

export const getTryouts = unstable_cache(
  async () => {
    return db.tryout.findMany({
      include: {
        course: true,
      },
    });
  },
  ["tryouts"],
  {
    revalidate: 60 * 10,
    tags: ["tryouts"],
  },
);
