# Trash Reminder Automation for Slack

## Overview
The primary objective of this project is to streamline the process of managing and notifying house members about their trash duties. At the Cal Acacia Academic Fraternity, trash needs to be taken out by two brothers every other day. Previously, one had to manually decide who will do trash, send them a message, confirm it was done, and tally their points. Now, the House Manager fills in names, and the script will check the page everyday and use the Slack API to remind those who are on trash both on the day before and day of, with appropriate messages. When the House Manager comfirms they did their job, he can go in and click the checkbox for each person, and the sheet will automatically tally points and import it into the Master HP Manager Sheet. By automating reminders, the script ensures that everyone is informed about their responsibilities with ease, leading to a cleaner and more organized living environment.

## Features
- Automated Slack reminders for trash duties.
- Sends reminders both the day before and the day of the trash duty.
- Supports multiple recipients per duty.

## Configurations
- 'urlopen': Slack API URL for opening a conversation.
- 'urlschedMsg': Slack API URL for sending a message.
- 'token': Your Slack API token (replace with your actual token).
- 'dayBeforeMessage': Message to send the day before trash duty.
- 'dayOfMessage': Message to send on the day of trash duty.

## Script Details
The script uses Slack API to send messages/reminders for trash duties. It extracts information from the Google Sheet, including recipient details and task dates, and sends appropriate reminders.
- The todayStatus function checks the current date and sends reminders if it matches the day before or the day of the trash duty.
- The getSlackIds function extracts Slack IDs of recipients from the Google Sheet.
- The sendSlackGroupMessage function opens a Slack conversation and sends the reminder message.

## Setup Instructions (for House Manager)
During summer, before the start of the semester:
1. Create new Master HP Manager Sheet and Cleaning Signup Sheet.
2. Use IMPORTRANGE to link Master HP Manager to the brotherStatus page of Cleaning Signup.
3. On the "Trash" page, setup dates and names for the semester.
4. Create a new 'script.gs', and copy/paste the SlackBot into your script.
5. Ensure all sheet names, data ranges, column values, etc, are correct.
6. Replace the 'token' variable with the appropriate Slack API token for the Trash Reminder Bot App.
7. Set up a trigger to run the 'todayStatus' function daily.
8. The script will automatically send reminders to recipients on the day before/of the trash duty.