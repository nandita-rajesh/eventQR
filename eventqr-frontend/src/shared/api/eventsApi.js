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

export default {
  getOrganizerEvents,
};
