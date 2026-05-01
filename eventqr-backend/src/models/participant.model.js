const participantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,

  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },

  qrToken: {
    type: String,
    unique: true,
  },

  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Participant", participantSchema);
