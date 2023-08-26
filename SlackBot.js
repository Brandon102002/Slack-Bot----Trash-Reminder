const urlopen = "https://slack.com/api/conversations.open";
const urlschedMsg = "https://slack.com/api/chat.postMessage";
const token = ""; // Insert Slack Token
const date = Utilities.formatDate(new Date(), "PST", "MM-dd");

const dayBeforeMessage = "You are on trash tomorrow! Work is typically split by Upstairs (roof, laundry room, upstairs bathroom, upstairs main hall, main hall bathroom) and Downstairs (downstairs hall, downstairs bathroom, kitchen, alumni room, library), though this is only a recommendation and you may split the work however you choose as long as they all get taken care of."
const dayOfMessage = "This is your reminder that you are on trash today! Let Stinson know if you can't find trash bags in the house or if there is no trash can at a listed spot. If a bin is disgusting inside, please wash it out in the parking lot, turn it upside down by the side of the house to dry, and let Stinson know."

function todayStatus() {
  // Extract rows {task date, name1, checkbox, name2, checbox, notification date}
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trash");
  var range = sheet.getRange(4, 1, 63, 6);
  var data = range.getValues();

  for (i in data) {
    var dayBefore = Utilities.formatDate(new Date(data[i][5]), "PST", "MM-dd");
    var dayOf = Utilities.formatDate(new Date(data[i][0]), "PST", "MM-dd");

    if (date == dayBefore) {
      var recipients = [data[i][1], data[i][3]];
      var ids = getSlackIds(recipients);

      return sendSlackGroupMessage(ids, dayOf, dayBeforeMessage);
    }

    if (date == dayOf) {
      var recipients = [data[i][1], data[i][3]];
      var ids = getSlackIds(recipients);

      return sendSlackGroupMessage(ids, dayOf, dayOfMessage);
    }
  }
  return false;
}

function getSlackIds(recipients) {
  // Extract rows {lastName, brotherStatus, inHouse, roomID, slackID}
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("brotherStatus");
  var range = sheet.getRange(4, 2, 50, 5);
  var data = range.getValues();
  const houseManagerId = "U030X11DCG4";

  var ids = [];
  for (r in recipients){
    for (i in data) {
      if (recipients[r] == data[i][0]) {
        ids = ids.concat([data[i][4]]);
      }
    }
  }

  if (!ids.includes(houseManagerId)) {
    ids = ids.concat(houseManagerId);
  }

  return ids;
}

function sendSlackGroupMessage(recipients, date, message) {
  // Open Channel
  const channelName = "trash-group-"+date;

  const openParams = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + token
    },
    payload: JSON.stringify({
      "name": channelName,
      "return_im": true,
      "users": recipients.join(",")
    })
  };

  const openResponse = UrlFetchApp.fetch(urlopen, openParams);
  const openData = JSON.parse(openResponse.getContentText());

  if (!openData.ok) {
    Logger.log("failed to create group channel for trash on " + date);
    Logger.log(openData);
    return false;
  }

  // Send Message
  const channelID = openData.channel.id;

  const messageParams = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + token
    },
    payload: JSON.stringify({
      "channel": channelID,
      "text": message
    })
  };

  const messageResponse = UrlFetchApp.fetch(urlschedMsg, messageParams);
  const messageData = JSON.parse(messageResponse.getContentText());

  if (!messageData.ok) {
    Logger.log("Failed to send message for trash on "+ date);
    Logger.log(messageData);
    return false;
  }
  
  return true;
}