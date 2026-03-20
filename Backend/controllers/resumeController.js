import Resume from "../models/Resume.js";
import { PDFDocument, rgb } from "pdf-lib";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";
import fs from "fs";
import puppeteer from "puppeteer";

// Create Resume
export const createResume = async (req, res) => {
  try {
    const { name, email, phone, linkedIn, summary, skills, education, experience, dob } = req.body;

    if (!name || !email || !phone || !dob) {
      return res.status(400).json({ message: "Name, Email, Phone, and DOB are required" });
    }

    const resume = new Resume({
      name,
      email,
      phone,
      linkedIn,
      summary,
      skills,
      education,
      experience,
      dob, // ✅ include DOB
      resumeId: `RES-${new Date().getFullYear()}-${uuidv4().slice(0, 8)}`,
    });

    await resume.save();
    res.status(201).json(resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Resume by ID
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download PDF (with name + DOB verification)
export const downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dob } = req.query;

    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: "Not found" });

    const safeName = name.replace(/\s+/g, '');
    const password = `${safeName}-${dob}`;

    // ✅ HTML TEMPLATE (THIS WILL RENDER PROPERLY)
    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial; padding: 30px; }
          h1 { margin-bottom: 5px; }
          .section { margin-top: 20px; }
          .skills span {
            display: inline-block;
            background: #e0e7ff;
            padding: 5px 10px;
            margin: 5px;
            border-radius: 10px;
          }
        </style>
      </head>
      <body>
        <h1>${resume.name}</h1>
        <p>${resume.email} | ${resume.phone} | ${resume.linkedIn}</p>

        <div class="section">
          <h2>Professional Summary</h2>
          <p>${resume.summary}</p>
        </div>

        <div class="section skills">
          <h2>Skills</h2>
          ${resume.skills.map(skill => `<span>${skill}</span>`).join("")}
        </div>

        <div class="section">
          <h2>Education</h2>
          <ul>
            ${resume.education.map(e =>
              `<li>${e.degree} - ${e.institute} (${e.year})</li>`
            ).join("")}
          </ul>
        </div>

        <div class="section">
          <h2>Work Experience</h2>
          <ul>
            ${resume.experience.map(e =>
              `<li>${e.title} at ${e.company} (${e.duration})</li>`
            ).join("")}
          </ul>
        </div>
      </body>
      </html>
    `;

    // ✅ Launch browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const filePath = `resume-${id}.pdf`;
    const protectedPath = `protected-${id}.pdf`;

    // ✅ Generate PDF
    await page.pdf({ path: filePath, format: "A4" });

    await browser.close();

    // ✅ Encrypt using qpdf
    exec(
      `qpdf --encrypt "${password}" "${password}" 256 -- "${filePath}" "${protectedPath}"`,
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Encryption failed");
        }

         await Resume.findByIdAndUpdate(id, {
      $inc: { downloads: 1 }
    });
        const file = fs.readFileSync(protectedPath);

        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=resume-${id}.pdf`
        });

        res.send(file);

        fs.unlinkSync(filePath);
        fs.unlinkSync(protectedPath);
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error", error: err.message });
  }
};
