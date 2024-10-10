import "./App.css";
import { Route, Routes, NavLink } from "react-router-dom";
import AvailableShifts from "./components/AvailableShifts";
import { useEffect, useState } from "react";
import MainShift from "./components/MainShift";

function App() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(null);

  const cancelShift = async (id) => {
    setLoading(id);
    try {
      const response = await fetch(
        `http://127.0.0.1:8080/shifts/${id}/cancel`,
        {
          method: "POST",
          headers: {},
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setData();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(null);
    }
  };

  const shiftStarted = (shift) => {
    return Date.now() > shift.startTime;
  };
  const setData = async () => {
    await fetch("http://127.0.0.1:8080/shifts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setShifts(data);
      })
      .catch((error) => {});
  };

  useEffect(() => {
    setData();
  }, []);
  return (
    <div className="container">
      <div className="container_btn">
        <div className="myshift_btn">
          <NavLink
            className="myshift_link"
            to="/"
            style={({ isActive }) => ({
              color: isActive ? "#004FB4" : "#A4B8D3",
            })}
          >
            My Shifts
          </NavLink>
        </div>
        <div className="availshift_btn">
          <NavLink
            className="avail_link"
            to="/availableShifts"
            style={({ isActive }) => ({
              color: isActive ? "#004FB4" : "#A4B8D3",
            })}
          >
            Available Shifts
          </NavLink>
        </div>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <MainShift
              shifts={shifts}
              cancelShift={cancelShift}
              shiftStarted={shiftStarted}
              loading={loading}
            />
          }
        />
        <Route
          path="/availableShifts"
          element={
            <AvailableShifts
              shifts={shifts}
              cancelShift={cancelShift}
              shiftStarted={shiftStarted}
              setData={setData}
              loading={loading}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
