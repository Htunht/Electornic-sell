import { Request, Response } from "express";
import { AnnouncementRepository } from "../../respositry/announcementRepository";

const announcementRepo = new AnnouncementRepository();

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, type, teacherId, headTeacherId, major, year } = req.body;
    
    const announcement = await announcementRepo.createAnnouncement({
      title,
      content,
      type,
      teacherId,
      headTeacherId,
      major: major === "ALL" ? undefined : major,
      year: year === "ALL" ? undefined : year,
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { major, year } = req.query;
    const announcements = await announcementRepo.getAnnouncements({
      major: major === "ALL" ? undefined : major as any,
      year: year === "ALL" ? undefined : year as any,
    });
    res.status(200).json({ success: true, data: announcements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await announcementRepo.getAllAnnouncements();
    res.status(200).json({ success: true, data: announcements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await announcementRepo.deleteAnnouncement(id);
    res.status(200).json({ success: true, message: "Announcement deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
