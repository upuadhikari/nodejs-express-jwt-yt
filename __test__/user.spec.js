describe("Authentication", () => {
  it("should throw an error if the password value is empty", async () => {
    try {
      await new User({
        name: "sam",
        phonenumber: "9811111111",
        email: "sam@ed.info",
        password: "",
      }).save();
    } catch (err) {
      expect("err").toEqual("err");
    }
  });
});
