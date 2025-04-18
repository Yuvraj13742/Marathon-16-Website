import { db } from "@/db";
import { Hono } from "hono";
import { masterTable } from "@/db/schema";
import { createUserSchema } from "@/validations/masterSchema";
import { zValidator } from "@hono/zod-validator";
import nodemailer from "nodemailer";


const validationMiddleware = zValidator("json", createUserSchema);

const transporters = [
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "contact.pathfindersit@gmail.com",
      pass: "wwfz arcg ejmk joao",
    },
  }),
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "marathonpathfinder@gmail.com",
      pass: "qgjq kqrj qsfj ogzb",
    },
  }),
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "pathfinderoffical5@gmail.com",
      pass: "yzmx qqrj iiec trgs",
    },
  }),
];

let transporterIndex = 0;
const getNextTransporter = () => {
  const transporter = transporters[transporterIndex];
  transporterIndex = (transporterIndex + 1) % transporters.length;
  return transporter;
};

const sendEmail = async (to: string, uniqueCode: string) => {
  const transporter = getNextTransporter();
  const mailOptions = {
    from: '"Team PathFinder" <pathfinder@gmail.com>',
    to,
    subject: "Registration Successful",
    text: `You have been successfully registered. Your unique code is: ${uniqueCode}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}:`, info.response);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

// Registration routes
const registerRouter = new Hono()
  .post("/girls", validationMiddleware, async (c) => {
    const body = c.req.valid("json");

    const usn = body.usn?.toUpperCase(); // Capitalize USN if provided
    const isSitian = !!usn; // true if USN exists

    const res = await db
      .insert(masterTable)
      .values({
        unique_code: body.unique_code,
        name: body.name,
        phone_no: body.phone_no,
        usn,
        category: "girls",
        Gender: "girl",
        isSitian,
      })
      .returning();

    if (res.length === 0)
      return c.json({ error: "Error in registering user!" }, 400);

    if (body.email) await sendEmail(body.email, body.unique_code);

    return c.json({ message: "User registered successfully" }, 201);
  })
  .post("/boys", validationMiddleware, async (c) => {
    const body = c.req.valid("json");

    const usn = body.usn?.toUpperCase(); // Capitalize USN if provided
    const isSitian = !!usn; // true if USN exists

    const res = await db
      .insert(masterTable)
      .values({
        unique_code: body.unique_code,
        name: body.name,
        phone_no: body.phone_no,
        usn,
        category: "boys",
        Gender: "boy",
        isSitian,
      })
      .returning();

    if (res.length === 0)
      return c.json({ error: "Error in registering user!" }, 400);

    if (body.email) await sendEmail(body.email, body.unique_code);

    return c.json({ message: "User registered successfully" }, 201);
  })
  .post("/walkathon", validationMiddleware, async (c) => {
    const body = c.req.valid("json");

    const genderValue = body.Gender?.toLowerCase();

    const Gender = genderValue as "girl" | "boy";
    const category = Gender === "girl" ? "walkathon_f" : "walkathon_m";

    const res = await db
      .insert(masterTable)
      .values({
        unique_code: body.unique_code,
        name: body.name,
        phone_no: body.phone_no,
        usn: body.usn,
        category,
        Gender,
      })
      .returning();

    if (res.length === 0) {
      return c.json({ error: "Error in registering user!" }, 400);
    }

    if (body.email) await sendEmail(body.email, body.unique_code);

    return c.json({ message: "User registered successfully" }, 201);
  });

export default registerRouter;
