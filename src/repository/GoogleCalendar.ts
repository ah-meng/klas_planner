import CalendarEvent from '../model/CalendarEvent';
import ICalendar from "./ICalendar";
import {calendar_v3, google} from 'googleapis';

export class GoogleCalendar implements ICalendar {
    addEvent(): Promise<void> {
        return Promise.resolve(undefined);
    }

    async getEvents(): Promise<CalendarEvent[]> {
        const calendar: calendar_v3.Calendar = google.calendar({version: 'v3'})
        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        })
        const events = res.data.items;

        return [];
    }
}