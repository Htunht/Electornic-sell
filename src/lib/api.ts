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
  
  deleteAssignment: (id: string) => 
    api.delete(`/teachers/me/assignments/${id}`),

  getStudents: (params?: { year?: string; search?: string; page?: number; limit?: number }) =>
    api.get("/teachers/students", { params }),

  createSubject: (data: { code: string; name: string; year: string; semester?: number; creditHours?: number }) =>
    api.post("/teachers/subjects", data),
  updateSubject: (id: string, data: { code?: string; name?: string; creditHours?: number; year?: string; semester?: number }) =>
    api.put(`/teachers/subjects/${id}`, data),
  deleteSubject: (id: string) =>
    api.delete(`/teachers/subjects/${id}`),

  /** Classes Tab: Attendance handled by subject */
  saveBulkAttendance: (data: {
    subjectId: string;
    attendanceData: { studentId: string; status: string; date: string }[];
  }) => api.post("/admin/teachers/bulk-attendance", data),

  /** Students Tab: Marks handled per student */
  saveStudentMarks: (data: {
    studentId: string;
    subjectId: string;
    marks: number;
  }) => api.post("/admin/teachers/update-marks", data),

  // Keep compatibility for bulk results if needed
  bulkUpsertResults: (data: any) => 
    api.post("/teachers/results/bulk", data),
};

export const calendarApi = {
  getEvents: () => api.get("/calendar/events"),
};
