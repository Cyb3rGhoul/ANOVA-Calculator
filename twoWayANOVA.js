document.getElementById("num-blocks").addEventListener("input", generateInputs);
document
  .getElementById("num-treatments")
  .addEventListener("input", generateInputs);

let dataInputs = [];

function generateInputs() {
  const numBlocks = parseInt(document.getElementById("num-blocks").value);
  const numTreatments = parseInt(
    document.getElementById("num-treatments").value
  );
  const dataInputsContainer = document.getElementById("data-inputs");
  dataInputsContainer.innerHTML = "";

  dataInputs = [];

  for (let i = 0; i < numBlocks; i++) {
    const blockDiv = document.createElement("div");
    blockDiv.classList.add("form-group");

    const blockLabel = document.createElement("label");
    blockLabel.textContent = `Groups ${i + 1}:`;
    blockDiv.appendChild(blockLabel);

    const treatmentInputs = [];

    for (let j = 0; j < numTreatments; j++) {
      const inputDiv = document.createElement("div");
      inputDiv.classList.add("input-group");

      const label = document.createElement("label");
      label.textContent = `Column ${j + 1}:`;
      inputDiv.appendChild(label);

      const input = document.createElement("input");
      input.type = "text";
      input.required = true;
      inputDiv.appendChild(input);

      treatmentInputs.push(input);
      blockDiv.appendChild(inputDiv);
    }

    dataInputs.push(treatmentInputs);
    dataInputsContainer.appendChild(blockDiv);
  }
}

function generateExcelSheet() {
  const worksheet = XLSX.utils.json_to_sheet(
    [
      {
        "Source of Variation": "Between Rows",
        "Sum of Squares": blockSumOfSquares.toFixed(2),
        DOF: dfBlock,
        "Mean Square": meanSquareBlock.toFixed(2),
        "Variation Ratio": fRatioBlock.toFixed(2),
        "Table Value": "", // Add your F-table value here if available
      },
      {
        "Source of Variation": "Between Columns",
        "Sum of Squares": treatmentSumOfSquares.toFixed(2),
        DOF: dfTreatment,
        "Mean Square": meanSquareTreatment.toFixed(2),
        "Variation Ratio": fRatioTreatment.toFixed(2),
        "Table Value": "", // Add your F-table value here if available
      },
      {
        "Source of Variation": "Error",
        "Sum of Squares": errorSumOfSquares.toFixed(2),
        DOF: dfError,
        "Mean Square": meanSquareError.toFixed(2),
        "Variation Ratio": "", // No variation ratio for Error
        "Table Value": "", // No F-table value for Error
      },
      {
        "Source of Variation": "Total",
        "Sum of Squares": totalSumOfSquares.toFixed(2),
        DOF: numBlocks * numTreatments - 1,
        "Mean Square": "", // No mean square for Total
        "Variation Ratio": "", // No variation ratio for Total
        "Table Value": "", // No F-table value for Total
      },
    ],
    {
      header: [
        "Source of Variation",
        "Sum of Squares",
        "DOF",
        "Mean Square",
        "Variation Ratio",
        "Table Value",
      ],
      skipHeader: true,
    }
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ANOVA Results");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const excelData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });
  const downloadUrl = URL.createObjectURL(excelData);

  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = "anova_results.xlsx";
  downloadLink.click();

  // Revoke the temporary URL after the download is complete
  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 100);
}

function calculateTwoWayANOVA() {
  const numBlocks = parseInt(document.getElementById("num-blocks").value);
  const numTreatments = parseInt(
    document.getElementById("num-treatments").value
  );
  const dataInputs = document.querySelectorAll("#data-inputs input");
  const result = document.getElementById("result");
  result.innerHTML = "";

  if (dataInputs.length !== numBlocks * numTreatments) {
    result.innerHTML =
      "Error: The number of data inputs does not match the specified number of blocks and treatments.";
    return;
  }

  const data = Array.from(dataInputs, (input) => parseFloat(input.value));
  const n = data.length;
  const grandTotal = data.reduce((sum, value) => sum + value, 0);
  const correctionFactor = Math.pow(grandTotal, 2) / n;

  let totalSumOfSquares = 0;
  for (const value of data) {
    totalSumOfSquares += Math.pow(value, 2);
  }
  totalSumOfSquares -= correctionFactor;

  let treatmentSumOfSquares = 0;
  const treatmentTotals = new Array(numTreatments).fill(0);
  for (let i = 0; i < n; i++) {
    const value = data[i];
    const treatment = i % numTreatments;
    treatmentTotals[treatment] += value;
  }
  for (const treatmentTotal of treatmentTotals) {
    treatmentSumOfSquares += Math.pow(treatmentTotal, 2) / (n / numTreatments);
  }
  treatmentSumOfSquares -= correctionFactor;

  let blockSumOfSquares = 0;
  const blockTotals = new Array(numBlocks).fill(0);
  for (let i = 0; i < n; i++) {
    const value = data[i];
    const block = Math.floor(i / numTreatments);
    blockTotals[block] += value;
  }
  for (const blockTotal of blockTotals) {
    blockSumOfSquares += Math.pow(blockTotal, 2) / (n / numBlocks);
  }
  blockSumOfSquares -= correctionFactor;

  const errorSumOfSquares =
    totalSumOfSquares - treatmentSumOfSquares - blockSumOfSquares;
  const dfTreatment = numTreatments - 1;
  const dfBlock = numBlocks - 1;
  const dfError = (numBlocks - 1) * (numTreatments - 1);
  const meanSquareTreatment = treatmentSumOfSquares / dfTreatment;
  const meanSquareBlock = blockSumOfSquares / dfBlock;
  const meanSquareError = errorSumOfSquares / dfError;
  const fRatioTreatment = meanSquareTreatment / meanSquareError;
  const fRatioBlock = meanSquareBlock / meanSquareError;

  result.innerHTML += `<table border="1" cellpadding="5">
    <tr>
      <th>Source of Variation</th>
      <th>Sum of Squares</th>
      <th>DOF</th>
      <th>Mean Square</th>
      <th>Variation Ratio</th>
      <th>Table Value (F)</th>
    </tr>
    <tr>
      <td>Between Rows</td>
      <td>${blockSumOfSquares.toFixed(2)}</td>
      <td>${dfBlock}</td>
      <td>${meanSquareBlock.toFixed(2)}</td>
      <td>${fRatioBlock.toFixed(2)}</td>
      <td><input type="number" id="f-table-block" step="0.01" required></td>
    </tr>
    <tr>
      <td>Between Columns</td>
      <td>${treatmentSumOfSquares.toFixed(2)}</td>
      <td>${dfTreatment}</td>
      <td>${meanSquareTreatment.toFixed(2)}</td>
      <td>${fRatioTreatment.toFixed(2)}</td>
      <td><input type="number" id="f-table-treatment" step="0.01" required></td>
    </tr>
    <tr>
      <td>Error</td>
      <td>${errorSumOfSquares.toFixed(2)}</td>
      <td>${dfError}</td>
      <td>${meanSquareError.toFixed(2)}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Total</td>
      <td>${totalSumOfSquares.toFixed(2)}</td>
      <td>${numBlocks * numTreatments - 1}</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </table>`;

  const calculateButton = document.createElement("button");
  calculateButton.textContent = "Calculate Conclusion";
  calculateButton.onclick = function () {
    checkHypothesis(fRatioBlock, fRatioTreatment);
  };
  result.appendChild(calculateButton);

  function checkHypothesis(fRatioBlock, fRatioTreatment) {
    const fTableBlock = parseFloat(
      document.getElementById("f-table-block").value
    );
    const fTableTreatment = parseFloat(
      document.getElementById("f-table-treatment").value
    );

    const result = document.getElementById("result");

    result.innerHTML += "<p>Conclusion:</p>";

    if (fRatioBlock > fTableBlock) {
      result.innerHTML +=
        "<p>Null hypothesis for rows (Groups) is rejected.</p>";
    } else {
      result.innerHTML +=
        "<p>Null hypothesis for rows (Groups) is accepted.</p>";
    }

    if (fRatioTreatment > fTableTreatment) {
      result.innerHTML +=
        "<p>Null hypothesis for columns (Columns) is rejected.</p>";
    } else {
      result.innerHTML +=
        "<p>Null hypothesis for columns (Columns) is accepted.</p>";
    }

    const excelButton = document.createElement("button");
    excelButton.textContent = "Generate Excel Sheet";
    excelButton.onclick = generateExcelSheet;
    result.appendChild(excelButton);

    function generateExcelSheet() {
      const worksheet = XLSX.utils.json_to_sheet(
        [
          {
            "Source of Variation": "Between Rows",
            "Sum of Squares": blockSumOfSquares.toFixed(2),
            DOF: dfBlock,
            "Mean Square": meanSquareBlock.toFixed(2),
            "Variation Ratio": fRatioBlock.toFixed(2),
            "Table Value": "", // Add your F-table value here if available
          },
          {
            "Source of Variation": "Between Columns",
            "Sum of Squares": treatmentSumOfSquares.toFixed(2),
            DOF: dfTreatment,
            "Mean Square": meanSquareTreatment.toFixed(2),
            "Variation Ratio": fRatioTreatment.toFixed(2),
            "Table Value": "", // Add your F-table value here if available
          },
          {
            "Source of Variation": "Error",
            "Sum of Squares": errorSumOfSquares.toFixed(2),
            DOF: dfError,
            "Mean Square": meanSquareError.toFixed(2),
            "Variation Ratio": "", // No variation ratio for Error
            "Table Value": "", // No F-table value for Error
          },
          {
            "Source of Variation": "Total",
            "Sum of Squares": totalSumOfSquares.toFixed(2),
            DOF: numBlocks * numTreatments - 1,
            "Mean Square": "", // No mean square for Total
            "Variation Ratio": "", // No variation ratio for Total
            "Table Value": "", // No F-table value for Total
          },
        ],
        {
          header: [
            "Source of Variation",
            "Sum of Squares",
            "DOF",
            "Mean Square",
            "Variation Ratio",
            "Table Value",
          ],
          skipHeader: false,
        }
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ANOVA Results");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const excelData = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      const downloadUrl = URL.createObjectURL(excelData);

      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = "anova_results.xlsx";
      downloadLink.click();

      // Revoke the temporary URL after the download is complete
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 100);
    }
  }
}

// function generateExcelSheet() {
//   const worksheet = XLSX.utils.json_to_sheet(
//     [
//       {
//         "Source of Variation": "Between Rows",
//         "Sum of Squares": blockSumOfSquares.toFixed(2),
//         DOF: dfBlock,
//         "Mean Square": meanSquareBlock.toFixed(2),
//         "Variation Ratio": fRatioBlock.toFixed(2),
//         "Table Value": "", // Add your F-table value here if available
//       },
//       {
//         "Source of Variation": "Between Columns",
//         "Sum of Squares": treatmentSumOfSquares.toFixed(2),
//         DOF: dfTreatment,
//         "Mean Square": meanSquareTreatment.toFixed(2),
//         "Variation Ratio": fRatioTreatment.toFixed(2),
//         "Table Value": "", // Add your F-table value here if available
//       },
//       {
//         "Source of Variation": "Error",
//         "Sum of Squares": errorSumOfSquares.toFixed(2),
//         DOF: dfError,
//         "Mean Square": meanSquareError.toFixed(2),
//         "Variation Ratio": "", // No variation ratio for Error
//         "Table Value": "", // No F-table value for Error
//       },
//       {
//         "Source of Variation": "Total",
//         "Sum of Squares": totalSumOfSquares.toFixed(2),
//         DOF: numBlocks * numTreatments - 1,
//         "Mean Square": "", // No mean square for Total
//         "Variation Ratio": "", // No variation ratio for Total
//         "Table Value": "", // No F-table value for Total
//       },
//     ],
//     {
//       header: [
//         "Source of Variation",
//         "Sum of Squares",
//         "DOF",
//         "Mean Square",
//         "Variation Ratio",
//         "Table Value",
//       ],
//       skipHeader: true,
//     }
//   );

//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "ANOVA Results");

//   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//   const excelData = new Blob([excelBuffer], {
//     type: "application/octet-stream",
//   });
//   const downloadUrl = URL.createObjectURL(excelData);

//   const downloadLink = document.createElement("a");
//   downloadLink.href = downloadUrl;
//   downloadLink.download = "anova_results.xlsx";
//   downloadLink.click();

//   // Revoke the temporary URL after the download is complete
//   setTimeout(() => {
//     URL.revokeObjectURL(downloadUrl);
//   }, 100);
// }

function generateInputs() {
  const numBlocks = parseInt(document.getElementById("num-blocks").value);
  const numTreatments = parseInt(
    document.getElementById("num-treatments").value
  );
  const dataInputsContainer = document.getElementById("data-inputs");
  dataInputsContainer.innerHTML = "";

  dataInputs = [];

  for (let i = 0; i < numBlocks; i++) {
    const blockDiv = document.createElement("div");
    blockDiv.classList.add("form-group");

    const blockLabel = document.createElement("label");
    blockLabel.textContent = `Block ${i + 1}:`;
    blockDiv.appendChild(blockLabel);

    const treatmentInputs = [];

    for (let j = 0; j < numTreatments; j++) {
      const inputDiv = document.createElement("div");
      inputDiv.classList.add("input-group");

      const label = document.createElement("label");
      label.textContent = `Treatment ${j + 1}:`;
      inputDiv.appendChild(label);

      const input = document.createElement("input");
      input.type = "text";
      input.required = true;
      inputDiv.appendChild(input);

      treatmentInputs.push(input);
      blockDiv.appendChild(inputDiv);
    }

    dataInputs.push(treatmentInputs);
    dataInputsContainer.appendChild(blockDiv);
  }
}

generateInputs();
