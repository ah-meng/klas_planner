import CalendarEvent from '../model/CalendarEvent';

export default interface ICalendar {
    getEvents(): Promise<CalendarEvent[]>;

    addEvent(): Promise<void>;
}