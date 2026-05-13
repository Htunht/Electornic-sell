import { api } from "./axios";

export const studentApi = {
  getMe: () => api.get("/students/me"),
  getResults: (academicYear?: string) => api.get("/students/me/results", { params: { academicYear } }),
  completeProfile: (data: { rollNo: string; year: string; phoneNumber?: string; address?: string }) =>
    api.post("/students/complete-profile", data),
  getAttendance: (params?: { startDate?: string; endDate?: string; subjectId?: string }) =>
    api.get("/students/me/attendance", { params }),
  getAnnouncements: (params?: { major?: string; year?: string }) =>
    api.get("/students/announcements", { params }),
};

export const headTeacherApi = {
  getMe: () => api.get("/head-teachers/me"),
  getAssignments: () => api.get("/head-teachers/me/assignments"),
  getSubjects: (params?: { year?: string }) => api.get("/head-teachers/me/subjects", { params }),

  createAssignment: (data: { subjectId: string; year: string; canEdit?: boolean }) =>
    api.post("/head-teachers/me/assignments", data),

  deleteAssignment: (id: string) =>
    api.delete(`/head-teachers/me/assignments/${id}`),

  getStudents: (params?: { year?: string; search?: string; page?: number; limit?: number }) =>
    api.get("/head-teachers/students", { params }),

  getTeachers: () => api.get("/head-teachers/teachers"),
  assignToTeacher: (teacherId: string, data: { subjectId: string; year: string; canEdit?: boolean }) =>
    api.post(`/head-teachers/teachers/${teacherId}/assignments`, data),

  createSubject: (data: { code: string; name: string; year: string; semester?: number; creditHours?: number }) =>
    api.post("/head-teachers/subjects", data),
  updateSubject: (id: string, data: { code?: string; name?: string; creditHours?: number; year?: string; semester?: number }) =>
    api.put(`/head-teachers/subjects/${id}`, data),
  deleteSubject: (id: string) =>
    api.delete(`/head-teachers/subjects/${id}`),

  bulkUpsertResults: (data: any) =>
    api.post("/head-teachers/results/bulk", data),

  bulkUpsertAttendance: (data: any) =>
    api.post("/head-teachers/attendance/bulk", data),

  getAnnouncements: () => api.get("/head-teachers/announcements"),
  createAnnouncement: (data: { title: string; content: string; type: string; major?: string; year?: string }) =>
    api.post("/head-teachers/announcements", data),
  deleteAnnouncement: (id: string) => api.delete(`/head-teachers/announcements/${id}`),
};

export const teacherApi = {
  getMe: () => api.get("/teachers/me"),
  getAssignments: () => api.get("/teachers/me/assignments"),
  getSubjects: (params?: { year?: string }) => api.get("/teachers/me/subjects", { params }),

  createAssignment: (data: { subjectId: string; year: string; canEdit?: boolean }) =>
    api.post("/teachers/me/assignments", data),

  deleteAssignment: (id: string) =>
    api.delete(`/teachers/me/assignments/${id}`),

  getStudents: (params?: { year?: string; search?: string; page?: number; limit?: number }) =>
    api.get("/teachers/students", { params }),

  saveStudentMarks: (data: { studentId: string; subjectId: string; marks: number }) =>
    api.post("/teachers/results/bulk", { 
      subjectId: data.subjectId, 
      records: [{ studentId: data.studentId, marks: data.marks }] 
    }),

  saveBulkAttendance: (data: { subjectId: string; attendanceData: any[] }) =>
    api.post("/teachers/attendance/bulk", {
      subjectId: data.subjectId,
      date: data.attendanceData[0]?.date,
      year: "YEAR_1", // This should be dynamic but let's match the old logic
      records: data.attendanceData.map(d => ({ studentId: d.studentId, status: d.status }))
    }),

  getAnnouncements: () => api.get("/teachers/announcements"),
};

export const calendarApi = {
  getEvents: (params?: { startDate?: string; endDate?: string }) => api.get("/calendar/events", { params }),
  saveEvent: (data: { date: string; title: string; description?: string }) => api.post("/calendar/events", data),
};
