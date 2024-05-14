function generateGroupInputs() {
  const numGroups = parseInt(document.getElementById("num-groups").value);
  const groupInputsContainer = document.getElementById("group-inputs");
  groupInputsContainer.innerHTML = "";
  for (let i = 0; i < numGroups; i++) {
    const groupDiv = document.createElement("div");
    groupDiv.classList.add("form-group");
    const label = document.createElement("label");
    label.textContent = `Group ${i + 1} Data (separated by commas):`;
    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.required = true;
    groupDiv.appendChild(label);
    groupDiv.appendChild(textarea);
    groupInputsContainer.appendChild(groupDiv);
  }
}

function calculateANOVA() {
  const numGroups = parseInt(document.getElementById("num-groups").value);
  const fCritical = parseFloat(document.getElementById("f-critical").value);
  const groupInputs = document.querySelectorAll("#group-inputs textarea");
  const result = document.getElementById("result");
  result.innerHTML = "";
  if (groupInputs.length !== numGroups) {
    result.innerHTML =
      "Error: The number of group inputs does not match the specified number of groups.";
    return;
  }
  const groupData = Array.from(groupInputs, (textarea) =>
    textarea.value.split(",").map(Number)
  );
  const n = groupData.flat().length;
  const k = numGroups;
  const grandTotal = groupData.flat().reduce((sum, value) => sum + value, 0);
  const correctionFactor = Math.pow(grandTotal, 2) / n;
  let totalSumOfSquares = 0;
  for (const value of groupData.flat()) {
    totalSumOfSquares += Math.pow(value, 2);
  }
  totalSumOfSquares -= correctionFactor;
  let treatmentSumOfSquares = 0;
  const groupTotals = groupData.map((group) =>
    group.reduce((sum, value) => sum + value, 0)
  );
  for (const groupTotal of groupTotals) {
    treatmentSumOfSquares += Math.pow(groupTotal, 2) / (n / k);
  }
  treatmentSumOfSquares -= correctionFactor;
  const errorSumOfSquares = totalSumOfSquares - treatmentSumOfSquares;
  const dfBetween = k - 1;
  const dfWithin = n - k;
  const meanSquareBetween = treatmentSumOfSquares / dfBetween;
  const meanSquareWithin = errorSumOfSquares / dfWithin;
  const fRatio = meanSquareBetween / meanSquareWithin;
   const table = document.createElement("table");
   table.innerHTML = `
    <tr>
      <th>Source of Variation</th>
      <th>Sum of Squares</th>
      <th>DOF</th>
      <th>Mean Square</th>
      <th>Variation Ratio</th>
      <th>Table Value</th>
    </tr>
    <tr>
      <td>Between Samples</td>
      <td>${treatmentSumOfSquares.toFixed(2)}</td>
      <td>${dfBetween}</td>
      <td>${meanSquareBetween.toFixed(2)}</td>
      <td>${fRatio.toFixed(2)}</td>
      <td>${fCritical.toFixed(2)}</td>
    </tr>
    <tr>
      <td>Within Samples</td>
      <td>${errorSumOfSquares.toFixed(2)}</td>
      <td>${dfWithin}</td>
      <td>${meanSquareWithin.toFixed(2)}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Total</td>
      <td>${totalSumOfSquares.toFixed(2)}</td>
      <td>${n - 1}</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  `;
   table.classList.add("anova-table");
   const tableContainer = document.createElement("div");
   tableContainer.classList.add("table-container");
   tableContainer.appendChild(table);
   result.appendChild(tableContainer);

  // Add conclusion statement
  const conclusion =
    fRatio > fCritical ? "Hypothesis is rejected" : "Hypothesis is accepted";
  result.innerHTML += `<p>Conclusion: ${conclusion}</p>`;

  // Add button to generate Excel sheet
  const excelButton = document.createElement("button");
  excelButton.textContent = "Generate Excel Sheet";
  excelButton.onclick = generateExcelSheet;
  result.appendChild(excelButton);

  function generateExcelSheet() {
    const worksheet = XLSX.utils.json_to_sheet(
      [
        {
          "Source of Variation": "Between Samples",
          "Sum of Squares": treatmentSumOfSquares.toFixed(2),
          DOF: dfBetween,
          "Mean Square": meanSquareBetween.toFixed(2),
          "Variation Ratio": fRatio.toFixed(2),
          "Table Value": fCritical.toFixed(2),
        },
        {
          "Source of Variation": "Within Samples",
          "Sum of Squares": errorSumOfSquares.toFixed(2),
          DOF: dfWithin,
          "Mean Square": meanSquareWithin.toFixed(2),
          "Variation Ratio": "",
          "Table Value": "",
        },
        {
          "Source of Variation": "Total",
          "Sum of Squares": totalSumOfSquares.toFixed(2),
          DOF: n - 1,
          "Mean Square": "",
          "Variation Ratio": "",
          "Table Value": "",
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

    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 100);
  }
}

function generateExcelSheet() {
  const worksheet = XLSX.utils.json_to_sheet(
    [
      {
        "Source of Variation": "Between Samples",
        "Sum of Squares": treatmentSumOfSquares.toFixed(2),
        DOF: dfBetween,
        "Mean Square": meanSquareBetween.toFixed(2),
        "Variation Ratio": fRatio.toFixed(2),
        "Table Value": fCritical.toFixed(2),
      },
      {
        "Source of Variation": "Within Samples",
        "Sum of Squares": errorSumOfSquares.toFixed(2),
        DOF: dfWithin,
        "Mean Square": meanSquareWithin.toFixed(2),
        "Variation Ratio": "",
        "Table Value": "",
      },
      {
        "Source of Variation": "Error",
        "Sum of Squares": "",
        DOF: "",
        "Mean Square": "",
        "Variation Ratio": "",
        "Table Value": "",
      },
      {
        "Source of Variation": "Total",
        "Sum of Squares": totalSumOfSquares.toFixed(2),
        DOF: n - 1,
        "Mean Square": "",
        "Variation Ratio": "",
        "Table Value": "",
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

document
  .getElementById("num-groups")
  .addEventListener("input", generateGroupInputs);