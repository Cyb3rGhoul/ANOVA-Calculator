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

  result.innerHTML += `<p>Correction Factor: ${correctionFactor.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Total Sum of Squares: ${totalSumOfSquares.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Treatment Sum of Squares: ${treatmentSumOfSquares.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Error Sum of Squares: ${errorSumOfSquares.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Degrees of Freedom (Between): ${dfBetween}</p>`;
  result.innerHTML += `<p>Degrees of Freedom (Within): ${dfWithin}</p>`;
  result.innerHTML += `<p>Mean Square Between: ${meanSquareBetween.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Mean Square Within: ${meanSquareWithin.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>F-Ratio: ${fRatio.toFixed(2)}</p>`;
  result.innerHTML += `<p>F-Critical: ${fCritical.toFixed(2)}</p>`;
}

document
  .getElementById("num-groups")
  .addEventListener("input", generateGroupInputs);

