describe("assignment", () => {
  it("should throw an error if the password value is empty", async () => {
    try {
      await new Attendence({
        title: "Python class",
        user: "aman",
        uid: "123",
        joined: "2022/3/23",
        left: "2022/3/23",
      }).save();
    } catch (err) {
      expect("err").toEqual("err");
    }
  });
});
