import prisma from "../lib/prisma";
import { AnnouncementType, Major, AcademicYear } from '@prisma/client';


export class AnnouncementRepository {
  async createAnnouncement(data: {
    title: string;
    content: string;
    type: AnnouncementType;
    teacherId?: string;
    headTeacherId?: string;
    major?: Major;
    year?: AcademicYear;
  }) {
    return await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        teacherId: data.teacherId,
        headTeacherId: data.headTeacherId,
        major: data.major,
        year: data.year,
      },
    });
  }

  async getAnnouncements(filters?: { major?: Major; year?: AcademicYear }) {
    return await prisma.announcement.findMany({
      where: {
        OR: [
          {
            major: filters?.major,
            year: filters?.year,
          },
          {
            major: null,
            year: null,
          },
          // Also include if it's for their major but all years
          {
            major: filters?.major,
            year: null,
          },
          // Or for their year but all majors
          {
            major: null,
            year: filters?.year,
          }
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          }
        },
        headTeacher: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          }
        }
      }
    });
  }

  async getAllAnnouncements() {
    return await prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          }
        },
        headTeacher: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          }
        }
      }
    });
  }

  async deleteAnnouncement(id: string) {
    return await prisma.announcement.delete({
      where: { id },
    });
  }
}
