import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Calendar } from 'lucide-react';
import EventList from './components/EventList';
import EventEditor from './components/EventEditor';
import axios from 'axios';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

// Carga la lista de correos electrónicos permitidos desde el archivo .env
const allowedEmails = (import.meta.env.VITE_ALLOWED_EMAILS || '').split(',');

interface Event {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

interface Calendar {
  id: string;
  summary: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);
      const userInfoResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );
      const email = userInfoResponse.data.email;

      if (allowedEmails.includes(email)) {
        setIsLoggedIn(true);
        setAccessToken(tokenResponse.access_token);
        await fetchCalendars(tokenResponse.access_token);
      } else {
        alert('Access denied: Your email is not allowed to use this application.');
      }
    },
    onError: () => {
      console.log('Login Failed');
    },
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email',
  });

  const fetchCalendars = async (token: string) => {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCalendars(response.data.items);
      if (response.data.items.length > 0) {
        setSelectedCalendar(response.data.items[0].id);
        await fetchEvents(token, response.data.items[0].id);
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
    }
  };

  const fetchEvents = async (token: string, calendarId: string) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            timeMin: new Date().toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
          },
        }
      );
      setEvents(response.data.items);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    if (accessToken && selectedCalendar) {
      fetchEvents(accessToken, selectedCalendar);
    }
  }, [selectedCalendar]);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Calendar className="mr-2" /> Editor Masivo de Google Calendar
        </h1>
        {!isLoggedIn ? (
          <button onClick={() => login()}>
            Login with Google
          </button>
        ) : (
          <div className="w-full max-w-4xl">
            <div className="mb-4">
              <label htmlFor="calendarSelect" className="block text-sm font-medium text-gray-700">
                Select Calendar
              </label>
              <select
                id="calendarSelect"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedCalendar || ''}
                onChange={(e) => setSelectedCalendar(e.target.value)}
              >
                {calendars.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.summary}
                  </option>
                ))}
              </select>
            </div>
            {accessToken && selectedCalendar && (
              <>
                <EventList events={events} selectedEvents={selectedEvents} setSelectedEvents={setSelectedEvents} />
                <EventEditor
                  selectedEvents={selectedEvents}
                  setEvents={setEvents}
                  accessToken={accessToken}
                  selectedCalendar={selectedCalendar}
                />
              </>
            )}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;