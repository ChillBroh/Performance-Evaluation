import React, { useState } from "react";
import * as XLSX from "xlsx";
const ExcelDataInsertMaster = () => {
  const [excelData, setExcelData] = useState([]);
  const [ExcoNames, setExcoName] = useState([]);
  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const paseData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(paseData);
    };
  };
  const see = () => {
    console.log(excelData);
  };
  const approved = () => {
    const approved = excelData.filter(
      (data) => data.GoalSheetStatus === "Approved"
    );
    console.log(approved);
  };
  const ExcoName = () => {
    const ExcoTotalCount = excelData.map((data) => {
      return data.Exco;
    });
    let uniqueNames = ExcoTotalCount.reduce((acc, name) => {
      if (!acc.includes(name)) {
        acc.push(name);
      }
      return acc;
    }, []);
    setExcoName(uniqueNames);
    console.log(uniqueNames);
  };

  const ExcoWithCount = async () => {
    let approvedCount = {};
    let notApprovedCount = {};
    let totalCount = {};
    await excelData.forEach((data) => {
      if (ExcoNames.includes(data.Exco)) {
        totalCount[data.Exco] = (totalCount[data.Exco] || 0) + 1;
      }
      if (data.GoalSheetStatus === "Approved") {
        if (ExcoNames.includes(data.Exco)) {
          approvedCount[data.Exco] = (approvedCount[data.Exco] || 0) + 1;
        }
      } else {
        if (ExcoNames.includes(data.Exco)) {
          notApprovedCount[data.Exco] = (notApprovedCount[data.Exco] || 0) + 1;
        }
      }
    });
    console.log("total COunt", totalCount);
    console.log("Approved Count", approvedCount);
    console.log("Not Approved", notApprovedCount);
    await ExcoNames.forEach((data) => {
      console.log(
        "approved percentage",
        data,
        approvedCount[data],
        totalCount[data],
        approvedCount[data]
          ? ((approvedCount[data] / totalCount[data]) * 100).toFixed(2)
          : "0%",
        "%"
      );
      console.log(
        "Not Approved percentage",
        data,
        notApprovedCount[data],
        totalCount[data],
        notApprovedCount[data]
          ? ((notApprovedCount[data] / totalCount[data]) * 100).toFixed(2)
          : "0%",
        "%"
      );
    });
  };
  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <br />
      <button onClick={see}>See</button>
      <br />
      <button onClick={approved}>approved data</button>
      <br />
      <button onClick={ExcoName}>Exco Names</button>
      <br />
      <button onClick={ExcoWithCount}>Exco Count</button>
    </div>
  );
};

export default ExcelDataInsertMaster;
