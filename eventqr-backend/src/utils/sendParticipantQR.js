import QRCode from "qrcode";
import sendMail from "./sendMail.js";

const sendParticipantQr = async (participant, event) => {

  const qrImage = await QRCode.toDataURL(
    participant.qrToken
  );

  // remove data:image/png;base64,
  const base64Data = qrImage.replace(
    /^data:image\/png;base64,/,
    ""
  );

  const html = `
    <div
        style="
        background:#f4f7fb;
        padding:20px 12px;
        font-family:Arial,sans-serif;
        "
    >

        <div
        style="
            max-width:520px;
            margin:auto;
            background:white;
            border-radius:16px;
            padding:32px;
            box-shadow:0 4px 20px rgba(0,0,0,0.08);
            text-align:center;
        "
        >

        <h1
            style="
            color:#2563eb;
            margin-bottom:8px;
            "
        >
            EventQR
        </h1>

        <p
            style="
            color:#666;
            margin-top:0;
            margin-bottom:28px;
            "
        >
            Registration Successful
        </p>

        <h2
            style="
            margin-bottom:12px;
            color:#111827;
            "
        >
            Hello ${participant.name},
        </h2>

        <p
            style="
            color:#4b5563;
            line-height:1.6;
            margin-bottom:24px;
            "
        >
            You have successfully registered for
            <strong>${event.title}</strong>.
        </p>

        <div
            style="
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:12px;
            padding:18px;
            margin-bottom:28px;
            text-align:left;
            "
        >

            <h3
            style="
                margin-top:0;
                margin-bottom:14px;
                color:#111827;
            "
            >
            Event Details
            </h3>

            <p style="margin:8px 0; color:#4b5563;">
            <strong>Date:</strong>
            ${new Date(event.date).toDateString()}
            </p>

            <p style="margin:8px 0; color:#4b5563;">
            <strong>Venue:</strong>
            ${event.venue}
            </p>

            <p style="margin:8px 0; color:#4b5563;">
            <strong>Description:</strong>
            ${event.description}
            </p>

        </div>

        <div
            style="
            background:#f9fafb;
            border-radius:12px;
            padding:20px;
            display:inline-block;
            margin-bottom:24px;
            "
        >
            <img
                src="cid:qrcode"
                alt="QR Code"
                style="
                    width:220px;
                    height:220px;
                    display:block;
                    margin:auto;
                "
            />
        </div>

        <p
            style="
            color:#6b7280;
            font-size:14px;
            margin-bottom:8px;
            "
        >
            Present this QR code during attendance scanning.
        </p>

        <div
            style="
            margin-top:28px;
            padding-top:20px;
            border-top:1px solid #e5e7eb;
            color:#9ca3af;
            font-size:13px;
            "
        >
            EventQR Attendance System
        </div>

        </div>

    </div>
    `;

  await sendMail(
    participant.email,
    `Your QR Code for ${event.title}`,
    html,
    [
        {
  filename: "qrcode.png",
  content: base64Data,
  contentType: "image/png",
  contentId: "qrcode",
},
    ]
  );
};

export default sendParticipantQr;