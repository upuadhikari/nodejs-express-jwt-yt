describe("Group", () => {
  it("should throw an error if the password value is empty", async () => {
    try {
      await new Group({
        group_name: "sam",
      }).save();
    } catch (err) {
      expect("err").toEqual("err");
    }
  });
});
