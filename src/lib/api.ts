import { api } from "./axios";

export const studentApi = {
  getMe: () => api.get("/students/me"),
  getResults: (academicYear?: string) => api.get("/students/me/results", { params: { academicYear } }),
};

export const teacherApi = {
  getMe: () => api.get("/teachers/me"),
  getAssignments: () => api.get("/teachers/me/assignments"),
};

export const calendarApi = {
  getEvents: () => api.get("/calendar/events"),
};
