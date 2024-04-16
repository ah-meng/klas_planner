import {promises as fs} from 'fs';
import path from 'path';
import process from 'process';
import {authenticate} from '@google-cloud/local-auth';
import {google} from 'googleapis';

class GoogleCalendar {
    private static SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
    private static TOKEN_PATH = path.join(process.cwd(), 'token.json');
    private static CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

    async authorize() {
        var client = await this.loadSavedCredentialsIfExists();
        if (client) {
            return client;
        }
        var client2 = await authenticate({
            scopes: GoogleCalendar.SCOPES,
            keyfilePath: GoogleCalendar.CREDENTIALS_PATH,
        });
        if (client2.credentials) {
            await this.saveCredentials(client2);
        }
        return client2;
    }

    private async loadSavedCredentialsIfExists() {
        try {
            const content = await fs.readFile(GoogleCalendar.TOKEN_PATH);
            const credentials = JSON.parse(content.toString());
            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }

    private async saveCredentials(client: any) {
        const content = await fs.readFile(GoogleCalendar.CREDENTIALS_PATH);
        const keys = JSON.parse(content.toString());
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(GoogleCalendar.TOKEN_PATH, payload);
    }

    async listEvents(auth: any) {
        const calendar = google.calendar({version: 'v3', auth});
        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        const events = res.data.items;
        if (!events || events.length === 0) {
            console.log('No upcoming events found.');
            return;
        }
        console.log('Upcoming 10 events:');
        events.map((event, i) => {
            // @ts-ignore
            const start = event.start.dateTime || event.start.date;
            console.log(event);
            console.log(`${start} - ${event.summary}`);
        });
    }
}

const calendar = new GoogleCalendar();
calendar.authorize().then(calendar.listEvents).catch(console.error);