export class NotificationClient {
    chatworkApiToken: string;
    chatworkRoomId: string;
    eventSourceValue: { [key: string]: string[] };
    infoTitle = '問い合わせフォームが送信されました';
    columnKey = {
        TIME_STAMP: 'タイムスタンプ',
        QUERY_TYPE: 'お問い合わせ種類（選択式）',
        QUERY_BODY: '問い合わせ内容',
        QUERY_APPENDIX: '問い合わせ内容補足 (添付ファイル)'
    }

    constructor(chatworkApiToken: string,
        chatworkRoomId: string,
        eventSourcevalue: { [key: string]: string[] }) {
        this.eventSourceValue = eventSourcevalue;
        this.chatworkRoomId = chatworkRoomId;
        this.chatworkApiToken = chatworkApiToken;
    }

    notify() {
        const message: string = this.createPostMessage();
        const fileUrl: string = this.eventSourceValue[this.columnKey.QUERY_APPENDIX].at(0) ?? "";
        const fileId: string | undefined = this.getFileId(fileUrl);
        if (fileId != null) {
            const blob: GoogleAppsScript.Base.Blob | undefined = this.getBlob(fileId);
            if (blob !== undefined) {
                this.sendMessageWithFile(message, blob);
            } else {
                Logger.log(`Failed to get blob. ${fileUrl}`)
                // Blobが取得できない場合は、メッセージ通知を試す
                this.sendMessage(message);
            }
        } else {
            this.sendMessage(message);
        }
    }

    getBlob(fileId: string): GoogleAppsScript.Base.Blob | undefined {
        try {
            const file = DriveApp.getFileById(fileId);
            return Utilities.newBlob(
                file.getBlob().getBytes(),
                file.getMimeType(),
                file.getName()
            );
        } catch (e) {
            Logger.log(e)
        }
    }

    private send(endpoint: string, payload: GoogleAppsScript.URL_Fetch.Payload) {
        const apiUrl = `https://api.chatwork.com/v2/rooms/${this.chatworkRoomId}/` + endpoint;
        try {
            const response = UrlFetchApp.fetch(apiUrl, {
                method: 'post',
                headers: { 'X-ChatWorkToken': this.chatworkApiToken },
                payload: payload
            });
            if (response.getResponseCode() !== 200) {
                Logger.log('Post failed');
            }
        } catch (e) {
            Logger.log(e);
        }
    }

    sendMessageWithFile(message: string, blob: GoogleAppsScript.Base.Blob) {
        this.send('files', { message: message, file: blob });
    }

    sendMessage(message: string) {
        this.send('messages', { body: message })
    }

    createPostMessage(): string {
        let message = `[info][title]${this.infoTitle}[/title]`;
        message += 'フォーム送信日時: ' + this.eventSourceValue[this.columnKey.TIME_STAMP] + '\n';
        message += '問い合わせ種類: ' + this.eventSourceValue[this.columnKey.QUERY_TYPE] + '\n';
        message += '問い合わせ内容: ' + this.eventSourceValue[this.columnKey.QUERY_BODY] + '\n';
        message += '添付ファイル(URL): ' + this.eventSourceValue[this.columnKey.QUERY_APPENDIX] + '\n';
        message += '[/info]';
        return message;
    }

    getFileId(fileUrl: string): string | undefined {
        const match = fileUrl.match('[?&]id=([^&]+)');
        return match ? match[1] : undefined;
    }
}