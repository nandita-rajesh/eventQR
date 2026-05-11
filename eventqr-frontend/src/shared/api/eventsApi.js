import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;
const EVENTS_API = `${BASE}/events`;

// Get events for the logged-in organizer
export const getOrganizerEvents = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.get(`${EVENTS_API}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// Get events assigned to the logged-in volunteer
export const getVolunteerEvents = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.get(`${BASE}/volunteers/me/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// Get specific event for volunteer by id
export const getVolunteerEvent = async (id) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.get(`${BASE}/volunteers/events/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// Get specific event for organizer by id
export const getEvent = async (id) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.get(`${EVENTS_API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Get participants for an event
export const getEventParticipants = async (eventId) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.get(`${BASE}/events/${eventId}/participants`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Server-side search participants: GET /events/{id}/participants/search?q=...
export const searchEventParticipants = async (eventId, q) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.get(`${BASE}/events/${eventId}/participants/search`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { q },
  });

  return res.data;
};

// Resend participant QR using documented endpoint: POST /events/{eventId}/participants/{participantId}/resend-qr
export const resendParticipantQR = async (eventId, participantId) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.post(`${BASE}/events/${eventId}/participants/${participantId}/resend-qr`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Add participant to event: POST /events/{eventId}/participants
export const addEventParticipant = async (eventId, participant) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.post(`${BASE}/events/${eventId}/participants`, participant, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Upload participants via CSV: POST /events/{id}/participants/upload
export const uploadParticipantsCSV = async (eventId, file) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const form = new FormData();
  form.append('file', file);

  const res = await axios.post(`${BASE}/events/${eventId}/participants/upload`, form, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};

// Get volunteers assigned to an event: GET /events/{eventId}/volunteers
export const getEventVolunteers = async (eventId) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.get(`${BASE}/events/${eventId}/volunteers`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Assign a volunteer to an event: POST /events/{id}/volunteers
export const assignVolunteer = async (eventId, volunteerId) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.post(`${BASE}/events/${eventId}/volunteers`, { volunteerId }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Search volunteers by name or email: GET /volunteers/search?q=...
export const searchVolunteers = async (q) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.get(`${BASE}/volunteers/search`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { q },
  });

  return res.data;
};

// Export attendance report CSV: GET /attendance/events/{id}/export
export const exportAttendanceCSV = async (eventId) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.get(`${BASE}/attendance/events/${eventId}/export`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/csv' },
    responseType: 'blob',
  });

  return res;
};

// Update an event: PUT /events/{id}
export const updateEvent = async (eventId, payload) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.put(`${EVENTS_API}/${eventId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Delete an event: DELETE /events/{id}
export const deleteEvent = async (eventId) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.delete(`${EVENTS_API}/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Add a session to an event: POST /events/{id}/sessions
export const addEventSession = async (eventId, sessionPayload) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.post(`${EVENTS_API}/${eventId}/sessions`, sessionPayload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Scan attendance: POST /attendance/scan { token, sessionId }
export const scanAttendance = async (tokenValue, sessionId) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.post(`${BASE}/attendance/scan`, { token: tokenValue, sessionId }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Manually mark attendance: POST /attendance/manual { participantId, sessionId }
export const markAttendanceManual = async (participantId, sessionId) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.post(`${BASE}/attendance/manual`, { participantId, sessionId }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Create a new event: POST /events
export const createEvent = async (eventPayload) => {
  const token = localStorage.getItem('token');
  if (!token) throw { status: 401, message: 'No token' };

  const res = await axios.post(`${EVENTS_API}`, eventPayload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

export default {
  getOrganizerEvents,
  getVolunteerEvents,
  getEventVolunteers,
  assignVolunteer,
  searchVolunteers,
};
