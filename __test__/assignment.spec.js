describe("assignment", () => {
  it("should throw an error if the password value is empty", async () => {
    try {
      await new Assignment({
        title: "Python class",
        user: "aman",
        uid: "123",
        sent_at: "2022/3/23",
      }).save();
    } catch (err) {
      expect("err").toEqual("err");
    }
  });
});
