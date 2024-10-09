import React, { useState } from 'react';

interface Event {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

interface EventListProps {
  events: Event[];
  selectedEvents: Event[];
  setSelectedEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const EventList: React.FC<EventListProps> = ({ events, selectedEvents, setSelectedEvents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const toggleEventSelection = (event: Event) => {
    if (selectedEvents.some(e => e.id === event.id)) {
      setSelectedEvents(selectedEvents.filter(e => e.id !== event.id));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const filterEvents = () => {
    return events.filter(event => {
      const eventStartDateTime = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date!);
      const eventEndDateTime = event.end?.dateTime ? new Date(event.end.dateTime) : event.end?.date ? new Date(event.end.date) : null;
      const startDateTime = startDate && startTime ? new Date(`${startDate}T${startTime}`) : null;
      const endDateTime = endDate && endTime ? new Date(`${endDate}T${endTime}`) : null;

      const matchesSearchTerm = event.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStartDate = startDateTime ? eventStartDateTime >= startDateTime : true;
      const matchesEndDate = endDateTime ? eventEndDateTime ? eventEndDateTime <= endDateTime : eventStartDateTime <= endDateTime : true;

      return matchesSearchTerm && matchesStartDate && matchesEndDate;
    });
  };

  const handleSelectAll = () => {
    const filteredEvents = filterEvents();
    if (selectAll) {
      setSelectedEvents(selectedEvents.filter(event => !filteredEvents.some(e => e.id === event.id)));
    } else {
      const newSelectedEvents = [...selectedEvents, ...filteredEvents.filter(event => !selectedEvents.some(e => e.id === event.id))];
      setSelectedEvents(newSelectedEvents);
    }
    setSelectAll(!selectAll);
  };

  const formatEventDate = (event: Event) => {
    if (event.start.dateTime) {
      return `${new Date(event.start.dateTime).toLocaleString()} - ${event.end?.dateTime ? new Date(event.end.dateTime).toLocaleString() : ''}`;
    } else if (event.start.date) {
      return `${new Date(event.start.date).toLocaleDateString()} - ${event.end?.date ? new Date(event.end.date).toLocaleDateString() : ''}`;
    }
    return 'Invalid Date';
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Eventos próximos</h2>
      <div className="mb-4 p-4 border border-gray-300 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Filtros</h3>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Fecha y hora de inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Fecha y hora de fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="mr-2"
          />
          Seleccionar todos los eventos visibles
        </label>
      </div>
      <ul className="space-y-2">
        {filterEvents().map((event) => (
          <li key={event.id} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedEvents.some(e => e.id === event.id)}
              onChange={() => toggleEventSelection(event)}
              className="mr-2"
            />
            <span>{event.summary} - {formatEventDate(event)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;