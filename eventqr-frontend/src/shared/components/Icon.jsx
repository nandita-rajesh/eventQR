import React from "react";

import {
  Calendar,
  MapPin,
  QrCode,
  LogOut,
  Menu,
  Users,
  Camera,
} from "lucide-react";

export default function Icon({
  name,
  size = 20,
  color = "currentColor",
}) {
  switch (name) {
    case "calendar":
      return <Calendar size={size} color={color} />;

    case "location":
      return <MapPin size={size} color={color} />;

    case "qr":
      return <QrCode size={size} color={color} />;

    case "logout":
      return <LogOut size={size} color={color} />;

    case "menu":
      return <Menu size={size} color={color} />;

    case "users":
      return <Users size={size} color={color} />;

    case "camera":
      return <Camera size={size} color={color} />;

    default:
      return null;
  }
}