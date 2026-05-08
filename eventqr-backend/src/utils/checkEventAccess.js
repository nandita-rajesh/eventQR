import VolunteerAssignment from "../models/volunteerAssignment.model.js";

const checkEventAccess = async (
  event,
  user
) => {

  // organizer owns event
  if (
    user.role === "organizer"
  ) {
    return (
      event.organizer.toString() === user.id
    );
  }

  // volunteer assignment
  if (
    user.role === "volunteer"
  ) {

    const assignment =
      await VolunteerAssignment.findOne({
        volunteer: user.id,
        event: event._id,
      });

    return !!assignment;
  }

  return false;
};

export default checkEventAccess;