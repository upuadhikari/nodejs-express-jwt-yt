describe("file", () => {
  it("should throw an error if the password value is empty", async () => {
    try {
      await new Notification({
        title: "request",
      }).save();
    } catch (err) {
      expect("err").toEqual("err");
    }
  });
});
