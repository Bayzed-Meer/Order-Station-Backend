const authenticateUser = async (req, res, Model) => {
  try {
    const { id } = req.user;
    const user = await Model.findOne({ id });
    if (!user) {
      res.status(400).json({ message: "User doesn't exist" });
      return null;
    }

    if (user.id !== id) {
      res.status(403).json({ message: "Unauthorized access" });
      return null;
    }

    return user;
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    return null;
  }
};

module.exports = authenticateUser;
