const urlopen = "https://slack.com/api/conversations.open";
const urlschedMsg = "https://slack.com/api/chat.postMessage";
const token = ""; // Insert Slack Token
const date = Utilities.formatDate(new Date(), "PST", "MM-dd");
const houseManagerId = "U05RACKV54J"; // Set manually per semester
const houseChannel = "C01HP47HD0E";

const dayBeforeMessage = "You are on trash tomorrow! Work is typically split by Upstairs (roof, laundry room, upstairs bathroom, upstairs main hall, main hall bathroom) and Downstairs (downstairs hall, downstairs bathroom, kitchen, alumni room, library), though this is only a recommendation and you may split the work however you choose as long as they all get taken care of."
const dayOfMessage = "This is your reminder that you are on trash today! Let the House Manager know if you can't find trash bags in the house or if there is no trash can at a listed spot. If a bin is disgusting inside, please wash it out in the parking lot, turn it upside down by the side of the house to dry, and let the House Manager know."
const finalReminder = "This is your final reminder to do trash if you haven't already."

function todayStatus() {
  // [[task date, name1, checkbox, name2, checbox, notification date]]
  data = pullTrashData(); 

  for (row in data) {
    var taskDate = Utilities.formatDate(new Date(data[row][0]), "PST", "MM-dd");
    var notifDate = Utilities.formatDate(new Date(data[row][5]), "PST", "MM-dd");

    if (date == notifDate) {
      var recipients = [data[row][1], data[row][3]];
      var ids = getIds(recipients);

      sendSlackGroupMessage(recipients, taskDate, dayBeforeMessage);
    }

    if (date == taskDate) {
      var recipients = [data[row][1], data[row][3]];
      var ids = getIds(recipients);

      sendHouseMessage(houseChannel, recipients[0], recipients[1], taskDate);
      sendSlackGroupMessage(ids, taskDate, dayOfMessage);
      scheduleSlackMessage(ids, taskDate, finalReminder);
    }
  }
}

function pullTrashData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trash");

  // Set to trash data range: (startRow, startCol, numRows, numCols)
  const range = sheet.getRange(4, 1, 63, 6);
  return range.getValues();
}

function pullIdData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("brotherStatus");

  // Set to brotherStatus data range: (startRow, startCol, numRows, numCols)
  const range = sheet.getRange(4, 3, 63, 9);
  return range.getValues();
}

function getIds(recipients) {
  //[[name, class, chapterStatus, statusPoints, legacyPoints, inHouse, Room, Birthday, SlackID]]
  const data = pullIdData(); 

  var ids = [];
  for (r in recipients) {
    for (row in data) {
      if (recipients[r] == data[row][0]) {
        ids = ids.concat([data[row][8]]); // Col w/ slackID
      }
    }
  }

  if (!ids.includes(houseManagerId)) {
    ids = ids.concat(houseManagerId);
  }

  return ids;
}

function sendHouseMessage(channelID, person1, person2) {
  var message = "Brothers on trash duty today are " + person1 + " and " + person2;

  const payload = {
    "channel": channelID,
    "text": message
  };

  postSlackMessage(payload, "send house slack message")
}

function sendSlackGroupMessage(recipients, date, message) {
  // First opens a dm with recipients, then sends a message
  const ids = getIds(recipients);
  const channelName = "trash-group-"+date;

  const payloadOpen = {
    "name": channelName,
    "return_im": true,
    "users": ids.join(",")
  };

  if (postSlackMessage(payloadOpen, "create recipient channel")) {
    const channelID = openData.channel.id;
    const payloadSend = {
      "channel": channelID,
      "text": message
    };
    
    postSlackMessage(payloadSend, "send recipient message")
  };
}

function scheduleSlackMessage(recipients, date, message) {
  const channelName = "trash-group-"+date;

  const payloadOpen = {
    "name": channelName,
    "return_im": true,
    "users": recipients.join(",")
  };

  postSlackMessage(payloadOpen, "open channel for final reminder")

  const channelID = openData.channel.id;
  const scheduledTime = new Date(new Date().setHours(20, 0, 0, 0)); // Sets the time to 8:00 PM.
  const unixTime = Math.floor(scheduledTime.getTime() / 1000);

  const payloadSend = {
    "channel": channelID,
    "post_at": unixTime,
    "text": message
  };

  postSlackMessage(payloadSend, "schedule final reminder")
  
  return true;
}

function postSlackMessage(payload, loggingReason) {
  // Takes a payload, string loggingReason to log failures, and outputs whether the API call went through
  const messageParams = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + token
    },
    payload: JSON.stringify(payload)
  };

  const scheduleResponse = UrlFetchApp.fetch("https://slack.com/api/chat.scheduleMessage", messageParams);
  const scheduleData = JSON.parse(scheduleResponse.getContentText());

  if (!scheduleData.ok) {
    Logger.log("Failed to " + loggingReason + " on " + date);
    Logger.log(scheduleData);
    return false
  }

  return true
}