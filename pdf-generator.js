// pdfGenerator.js
const PDFDocument = require("pdfkit");

class PDFGenerator {
  static generateGrantLetter(user, grantDetails) {
    const doc = new PDFDocument();

    // Add company letterhead or logo
    // Example: doc.image('path/to/company-logo.png', 50, 50, { width: 100 });

    // Title
    doc.fontSize(16).text("Employee Stock Option Plan (ESOP) Grant Letter", {
      align: "center",
    });

    // Date
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });

    // Employee Details
    doc.moveDown();
    doc.fontSize(12).text(`To: ${user?.name}`);
    doc.fontSize(12).text(`Employee ID: ${user?.employeeId}`);
    doc.fontSize(12).text(`Designation: ${user?.designation}`);
    doc.moveDown();

    // Grant Details
    doc.fontSize(12).text("Dear Employee,", { align: "left" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `We are pleased to inform you that you have been granted stock options under our ESOP.`
      );
    doc.moveDown();
    doc.fontSize(12).text(`Grant Date: ${grantDetails?.grantDate}`);
    doc
      .fontSize(12)
      .text(`Number of Options Granted: ${grantDetails?.numberOfOptions}`);
    doc.fontSize(12).text(`Vesting Schedule: ${grantDetails?.vestingSchedule}`);
    doc.moveDown();

    // Company Specific Instructions
    doc
      .fontSize(12)
      .text(
        `Please refer to the ESOP agreement for detailed terms and conditions.`
      );
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `For any inquiries or clarifications, please contact the HR department.`
      );
    doc.moveDown();

    // Closing
    doc
      .fontSize(12)
      .text(
        "Congratulations, and we look forward to your continued success with our company."
      );

    return doc;
  }
}

module.exports = PDFGenerator;
