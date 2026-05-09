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

export default {
  getOrganizerEvents,
  getVolunteerEvents,
};
