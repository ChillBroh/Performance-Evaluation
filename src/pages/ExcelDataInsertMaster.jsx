import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelDataInsertMaster = () => {
  const [excelData, setExcelData] = useState([]);
  const [excelData2, setExcelData2] = useState([]);
  const [differences, setDifferences] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 100;

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(parsedData);
    };
  };

  const handleFileUpload2 = (e) => {
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setExcelData2(parsedData);
    };
  };

  const compareData = () => {
    const trimHeaders = (obj) => {
      const trimmedObj = {};
      Object.keys(obj).forEach((key) => {
        // Remove all whitespace from the key
        const trimmedKey = key.replace(/\s+/g, "");
        const value = obj[key];

        // Trim the value if it is a string
        const trimmedValue = typeof value === "string" ? value.trim() : value;

        trimmedObj[trimmedKey] = trimmedValue;
      });
      return trimmedObj;
    };

    // Ensure the data is in array format and trim headers in each object (row) of both datasets
    if (Array.isArray(excelData) && Array.isArray(excelData2)) {
      const trimmedData1 = excelData.map(trimHeaders);
      const trimmedData2 = excelData2.map(trimHeaders);

      console.log("trimmedData1", trimmedData1);
      console.log("trimmedData2", trimmedData2);

      const diffs = [];
      const data2ByPersonNumber = {};

      // Index trimmedData2 by PersonNumber for quick lookup
      trimmedData2.forEach((row) => {
        data2ByPersonNumber[row.PersonNumber] = row;
      });

      // Iterate through trimmedData1 and compare with trimmedData2
      trimmedData1.forEach((row) => {
        const row2 = data2ByPersonNumber[row.PersonNumber];
        if (row2) {
          // If person is present in both files, compare their values
          const rowDiff = {};
          Object.keys(row).forEach((key) => {
            if (row[key] !== row2[key]) {
              rowDiff[key] = {
                oldValue: row[key],
                newValue: row2[key],
              };
            }
          });
          if (Object.keys(rowDiff).length > 0) {
            diffs.push({
              personNumber: row.PersonNumber,
              personName: row.CallingName,
              status: "Changed",
              changes: rowDiff,
            });
          }
        } else {
          // If person is in trimmedData1 but not in trimmedData2, mark as "Resigned"
          diffs.push({
            personNumber: row.PersonNumber,
            personName: row.CallingName,
            status: "Resigned",
            changes: null,
          });
        }
      });

      // Check for persons who are in trimmedData2 but not in trimmedData1 (Newly added)
      trimmedData2.forEach((row) => {
        if (!trimmedData1.find((d) => d.PersonNumber === row.PersonNumber)) {
          diffs.push({
            personNumber: row.PersonNumber,
            personName: row.CallingName,
            status: "Newly Added",
            changes: null,
          });
        }
      });

      setDifferences(diffs);
      setCurrentPage(0); // Reset to the first page when new data is compared
    } else {
      console.error("Excel data is not in array format");
    }
  };

  // Pagination logic: slice the data to show only the current page
  const currentData = differences.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload2} />
      <br />

      <button onClick={compareData}>Compare Data</button>
      <br />

      {currentData.length > 0 && (
        <>
          <table border={1}>
            <thead>
              <tr>
                <th>Person Number</th>
                <th>Person Name</th>
                <th>Status</th>
                <th>Column</th>
                <th>Old Value</th>
                <th>New Value</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((diff, rowIndex) =>
                diff.status === "Changed" ? (
                  Object.entries(diff.changes).map(([key, value], colIndex) => (
                    <tr key={`${rowIndex}-${colIndex}`}>
                      <td>{diff.personNumber}</td>
                      <td>{diff.personName}</td>
                      <td>{diff.status}</td>
                      <td>{key}</td>
                      <td>{value.oldValue}</td>
                      <td>{value.newValue}</td>
                    </tr>
                  ))
                ) : (
                  <tr key={rowIndex}>
                    <td>{diff.personNumber}</td>
                    <td>{diff.personName}</td>
                    <td>{diff.status}</td>
                    <td colSpan="4"></td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  (prev + 1) * itemsPerPage < differences.length
                    ? prev + 1
                    : prev
                )
              }
              disabled={(currentPage + 1) * itemsPerPage >= differences.length}
            >
              Next
            </button>
            <p>
              Page {currentPage + 1} of{" "}
              {Math.ceil(differences.length / itemsPerPage)}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ExcelDataInsertMaster;
