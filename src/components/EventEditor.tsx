import React, { useState } from 'react';
import axios from 'axios';

interface Event {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

interface EventEditorProps {
  selectedEvents: Event[];
  setEvents: (events: Event[]) => void;
  accessToken: string;
  selectedCalendar: string | null;
}

const EventEditor: React.FC<EventEditorProps> = ({ selectedEvents, setEvents, accessToken, selectedCalendar }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);

  const updateEvents = async () => {
    if (!selectedCalendar) {
      console.error('No calendar selected');
      return;
    }

    try {
      const updatedEvents = await Promise.all(selectedEvents.map(async (event) => {
        const updatedEvent: any = {};

        if (newTitle) {
          updatedEvent.summary = newTitle;
        }

        if (newDescription) {
          updatedEvent.description = newDescription;
        }

        if (allDay) {
          if (newStartDate) {
            updatedEvent.start = { date: newStartDate };
          }
          if (newEndDate) {
            updatedEvent.end = { date: newEndDate };
          }
        } else {
          if (newStartDate || newStartTime) {
            const existingStartDateTime = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date!);
            const startDate = newStartDate || existingStartDateTime.toISOString().split('T')[0];
            const startTime = newStartTime || existingStartDateTime.toISOString().split('T')[1].substring(0, 5);
            updatedEvent.start = {
              dateTime: new Date(`${startDate}T${startTime}`).toISOString(),
            };
          }

          if (newEndDate || newEndTime) {
            const existingEndDateTime = event.end?.dateTime ? new Date(event.end.dateTime) : event.end?.date ? new Date(event.end.date) : new Date();
            const endDate = newEndDate || existingEndDateTime.toISOString().split('T')[0];
            const endTime = newEndTime || existingEndDateTime.toISOString().split('T')[1].substring(0, 5);
            updatedEvent.end = {
              dateTime: new Date(`${endDate}T${endTime}`).toISOString(),
            };
          }
        }

        const response = await axios.patch(
          `https://www.googleapis.com/calendar/v3/calendars/${selectedCalendar}/events/${event.id}`,
          updatedEvent,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status !== 200) {
          console.error('Error updating event:', response.data);
        } else {
          console.log('Event updated:', response.data);
        }

        return response.data;
      }));

      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error updating events:', error);
    }
  };

  const deleteEvents = async () => {
    if (!selectedCalendar) {
      console.error('No calendar selected');
      return;
    }

    try {
      await Promise.all(selectedEvents.map(async (event) => {
        const response = await axios.delete(
          `https://www.googleapis.com/calendar/v3/calendars/${selectedCalendar}/events/${event.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status !== 204) {
          console.error('Error deleting event:', response.data);
        } else {
          console.log('Event deleted:', event.id);
        }
      }));

      // Fetch the updated list of events
      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${selectedCalendar}/events`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
      console.error('Error deleting events:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Editar eventos seleccionados</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nuevo título</label>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nueva descripción</label>
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          rows={3}
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="mr-2"
          />
          Todo el día
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
        <input
          type="date"
          value={newStartDate}
          onChange={(e) => setNewStartDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      {!allDay && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Hora de inicio</label>
          <input
            type="time"
            value={newStartTime}
            onChange={(e) => setNewStartTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Fecha de fin</label>
        <input
          type="date"
          value={newEndDate}
          onChange={(e) => setNewEndDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      {!allDay && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Hora de fin</label>
          <input
            type="time"
            value={newEndTime}
            onChange={(e) => setNewEndTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      )}
      <div className="flex space-x-4">
        <button
          onClick={updateEvents}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          disabled={selectedEvents.length === 0}
        >
          Actualizar eventos seleccionados
        </button>
        <button
          onClick={deleteEvents}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          disabled={selectedEvents.length === 0}
        >
          Eliminar eventos seleccionados
        </button>
      </div>
    </div>
  );
};

export default EventEditor;