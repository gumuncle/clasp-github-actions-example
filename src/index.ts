import { NotificationClient as NotificationClient } from "./notificationClient";

export const main = (e: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  const chatworkRoomId = PropertiesService.getScriptProperties().getProperty('TEST_ROOM_ID') ?? "";
  const chatworkApiToken = PropertiesService.getScriptProperties().getProperty('CHATWORK_API_TOKEN') ?? "";
  const notificationClient = new NotificationClient(chatworkApiToken, chatworkRoomId, e.namedValues);
  notificationClient.notify();
}