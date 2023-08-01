import { NotificationClient } from "../src/notificationClient";

describe('always correct', () => {

  it("1 == 1", () => {
    expect(1).toBe(1);
  });

  it("1 + 1 = 2", () => {
    expect(1 + 1).toBe(2);
  });
});

describe(NotificationClient.name, () => {
  const eventKeyValue = {
    "タイムスタンプ": ["hoge"],
    "お問い合わせ種類（選択式）": ["hoge"],
    "問い合わせ内容": ["hoge"],
    "問い合わせ内容補足 (添付ファイル)": ["https://example.com/?id=hogehoge"]
  }
  const a = new NotificationClient("dummy", "dummy", eventKeyValue);


  it("createPosetMessage", () => {
    const expected = `[info][title]問い合わせフォームが送信されました[/title]フォーム送信日時: hoge
問い合わせ種類: hoge
問い合わせ内容: hoge
添付ファイル(URL): https://example.com/?id=hogehoge
[/info]`
    expect(a.createPostMessage()).toBe(expected);
  });

  it("getFileId correct case", () => {
    expect(a.getFileId("https://example.com/?id=hogehoge")).toBe("hogehoge");
  });

  it("getFileId incorrect case", () => {
    expect(a.getFileId("https://example.com/?hoge=hogehoge")).toBe(undefined);
  });

});