import React, { useEffect } from 'react';
import axios from 'axios';

const AnalyzeToken = ({ token }) => {
  useEffect(() => {
    if (token && token !== "None") {
      axios.get(`http://localhost:8000/insights/analyze?token=${token}`)
        .then(response => {
          console.log("Analysis Result:", response.data);
        })
        .catch(error => {
          console.error("Request failed:", error.response?.data || error.message);
        });
    } else {
      console.warn("Token is missing or invalid");
    }
  }, [token]);

  return <div>Check console for analysis results.</div>;
};

export default AnalyzeToken;
