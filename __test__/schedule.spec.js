describe("file", () => {
  it("should throw an error if the password value is empty", async () => {
    try {
      await new Schedule({
        from: "2022/3/20",
        to: "2022/3/23",
        class: "java",
      }).save();
    } catch (err) {
      expect("err").toEqual("err");
    }
  });
});
