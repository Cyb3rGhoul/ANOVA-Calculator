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

  result.innerHTML += `<p>Correction Factor: ${correctionFactor.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Total Sum of Squares: ${totalSumOfSquares.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Treatment Sum of Squares: ${treatmentSumOfSquares.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Block Sum of Squares: ${blockSumOfSquares.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Error Sum of Squares: ${errorSumOfSquares.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Degrees of Freedom (Treatment): ${dfTreatment}</p>`;
  result.innerHTML += `<p>Degrees of Freedom (Block): ${dfBlock}</p>`;
  result.innerHTML += `<p>Degrees of Freedom (Error): ${dfError}</p>`;
  result.innerHTML += `<p>Mean Square (Treatment): ${meanSquareTreatment.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Mean Square (Block): ${meanSquareBlock.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>Mean Square (Error): ${meanSquareError.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>F-Ratio (Treatment): ${fRatioTreatment.toFixed(
    2
  )}</p>`;
  result.innerHTML += `<p>F-Ratio (Block): ${fRatioBlock.toFixed(2)}</p>`;
}

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
