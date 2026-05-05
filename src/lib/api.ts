import { api } from "./axios";

export const studentApi = {
  getMe: () => api.get("/students/me"),
  getResults: (academicYear?: string) => api.get("/students/me/results", { params: { academicYear } }),
  completeProfile: (data: { rollNo: string; year: string; phoneNumber?: string; address?: string }) =>
    api.post("/students/complete-profile", data),
  getAttendance: (params?: { startDate?: string; endDate?: string; subjectId?: string }) =>
    api.get("/students/me/attendance", { params }),
};

export const teacherApi = {
  getMe: () => api.get("/teachers/me"),
  getAssignments: () => api.get("/teachers/me/assignments"),
  getSubjects: (params?: { year?: string }) => api.get("/teachers/me/subjects", { params }),
  createAssignment: (data: { subjectId: string; year: string; canEdit?: boolean }) =>
    api.post("/teachers/me/assignments", data),
  deleteAssignment: (id: string) => api.delete(`/teachers/me/assignments/${id}`),
  getStudents: (params?: { year?: string; search?: string; page?: number; limit?: number }) =>
    api.get("/teachers/students", { params }),
  bulkUpsertResults: (data: { subjectId: string; year: string; semester?: number; academicYear?: string; records: { studentId: string; marks: number }[] }) =>
    api.post("/teachers/results/bulk", data),
  bulkUpsertAttendance: (data: { subjectId: string; year: string; date: string; records: { studentId: string; status: string }[] }) =>
    api.post("/teachers/attendance/bulk", data),
};

export const calendarApi = {
  getEvents: () => api.get("/calendar/events"),
};
