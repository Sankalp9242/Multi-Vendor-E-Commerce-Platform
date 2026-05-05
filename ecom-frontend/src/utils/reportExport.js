const createDownload = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const escapeCsvCell = (value) => {
  const stringValue = value === null || value === undefined ? "" : String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

const escapeHtml = (value) => {
  const stringValue = value === null || value === undefined ? "" : String(value);
  return stringValue
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const escapePdfText = (value) => {
  const stringValue = value === null || value === undefined ? "" : String(value);
  return stringValue.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
};

const buildPdf = (title, sections) => {
  const lines = [title, ""];

  sections.forEach((section) => {
    lines.push(section.title);
    lines.push(section.headers.join(" | "));
    section.rows.forEach((row) => {
      lines.push(row.map((cell) => String(cell ?? "")).join(" | "));
    });
    lines.push("");
  });

  const maxCharsPerLine = 95;
  const wrappedLines = [];

  lines.forEach((line) => {
    if (line.length <= maxCharsPerLine) {
      wrappedLines.push(line);
      return;
    }

    let remaining = line;
    while (remaining.length > maxCharsPerLine) {
      wrappedLines.push(remaining.slice(0, maxCharsPerLine));
      remaining = remaining.slice(maxCharsPerLine);
    }
    wrappedLines.push(remaining);
  });

  const linesPerPage = 40;
  const pages = [];
  for (let index = 0; index < wrappedLines.length; index += linesPerPage) {
    pages.push(wrappedLines.slice(index, index + linesPerPage));
  }

  const objects = [];
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");

  const pageObjectNumbers = [];
  const contentObjectNumbers = [];
  let nextObjectNumber = 3;

  pages.forEach(() => {
    pageObjectNumbers.push(nextObjectNumber++);
    contentObjectNumbers.push(nextObjectNumber++);
  });

  const kids = pageObjectNumbers.map((number) => `${number} 0 R`).join(" ");
  objects.push(`2 0 obj << /Type /Pages /Count ${pages.length} /Kids [${kids}] >> endobj`);

  pages.forEach((pageLines, index) => {
    const pageObjectNumber = pageObjectNumbers[index];
    const contentObjectNumber = contentObjectNumbers[index];
    const yStart = 800;
    const lineHeight = 18;

    const contentLines = [
      "BT",
      "/F1 11 Tf",
      `50 ${yStart} Td`,
    ];

    pageLines.forEach((line, lineIndex) => {
      if (lineIndex === 0) {
        contentLines.push(`(${escapePdfText(line)}) Tj`);
      } else {
        contentLines.push(`0 -${lineHeight} Td`);
        contentLines.push(`(${escapePdfText(line)}) Tj`);
      }
    });
    contentLines.push("ET");

    const stream = contentLines.join("\n");
    objects.push(
      `${pageObjectNumber} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >> /Contents ${contentObjectNumber} 0 R >> endobj`
    );
    objects.push(
      `${contentObjectNumber} 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
    );
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
};

export const downloadReportCsv = (fileName, sections) => {
  const parts = [];
  sections.forEach((section) => {
    parts.push(escapeCsvCell(section.title));
    parts.push(section.headers.map(escapeCsvCell).join(","));
    section.rows.forEach((row) => {
      parts.push(row.map(escapeCsvCell).join(","));
    });
    parts.push("");
  });

  createDownload(parts.join("\n"), `${fileName}.csv`, "text/csv;charset=utf-8;");
};

export const downloadReportExcel = (fileName, title, sections) => {
  const htmlSections = sections
    .map((section) => {
      const headerRow = section.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
      const bodyRows = section.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
        )
        .join("");

      return `
        <h2>${escapeHtml(section.title)}</h2>
        <table border="1">
          <thead><tr>${headerRow}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
        <br />
      `;
    })
    .join("");

  const workbook = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        ${htmlSections}
      </body>
    </html>
  `;

  createDownload(workbook, `${fileName}.xls`, "application/vnd.ms-excel;charset=utf-8;");
};

export const downloadReportPdf = (fileName, title, sections) => {
  const pdfContent = buildPdf(title, sections);
  createDownload(pdfContent, `${fileName}.pdf`, "application/pdf");
};
