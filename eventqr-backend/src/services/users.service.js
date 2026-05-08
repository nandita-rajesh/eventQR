import User from "../models/user.model.js";

export const searchVolunteersService =
  async (query) => {

    if (!query) {
      throw new Error("Search query required");
    }

    const volunteers = await User.find({
      role: "volunteer",

      $or: [
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },

        {
          email: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    })
    .select("name email")
    .limit(10);

    return volunteers;
  };