const express = require("express");
const prisma = require("./prisma");
const PDFGenerator = require("./pdf-generator");
const { Storage } = require("@google-cloud/storage");

// Initialize GCS client
const storage = new Storage({
  keyFilename: "key.json", // The path to your GCP service account key file
});

const bucketName = process.env.GCS_BUCKET_NAME;

const app = express();

// Middleware for JSON parsing
app.use(express.json());

// Your routes go here
app.get("/", (req, res) => {
  res.send({ message: "Dynamic PDF Generation POC" });
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new User
app.post("/create-user", async (req, res) => {
  const { name, email } = req.body;

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
    },
  });

  res.json(newUser);
});

// Create a PDF based on user data
app.get("/generate-pdf/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    // Fetch user data from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate the PDF using the PDFGenerator class
    // Make the data dynamic
    const pdfDoc = PDFGenerator.generateGrantLetter(
      { name: user?.name, employeeId: user?.id, designation: "Developer" },
      {
        grantDate: "08-02-2011",
        numberOfOptions: 100,
        vestingSchedule: "Test Vesting Schedule",
      }
    );

    // Upload the PDF to GCS
    const fileName = `poc/pdf-generation/${user.name}_grant_letter.pdf`; // path for file upload
    const file = storage.bucket(bucketName).file(fileName);
    const stream = file.createWriteStream();

    pdfDoc.pipe(stream);

    stream.on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "Error uploading PDF to GCS" });
    });

    stream.on("finish", async () => {
      // Set public read access for the file
      // await file.makePublic();

      // Provide the GCS URL for the uploaded file
      const gcsUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

      // Send success response to the user
      res.json({
        message: "PDF generated and uploaded to GCS successfully",
        gcsUrl,
      });
    });

    // End the PDF
    pdfDoc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
