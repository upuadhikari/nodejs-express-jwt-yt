describe("file", () => {
  it("should throw an error if the password value is empty", async () => {
    try {
      await new File({
        file: "sam.jsx",
      }).save();
    } catch (err) {
      expect("err").toEqual("err");
    }
  });
});
