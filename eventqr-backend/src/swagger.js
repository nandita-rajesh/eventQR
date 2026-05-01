import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EventQR API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],

    // 🔥 THIS PART (important)
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    // Apply globally (optional but recommended)
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/**/*.js"],
};

const specs = swaggerJsdoc(options);

export default specs;