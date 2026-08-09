import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/dashboard";
import Students from "./pages/students";
import Courses from "./pages/courses";
import Preferences from "./pages/preferences";
import Allocation from "./pages/allocation";
import Simulation from "./pages/simulation";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/admin" replace />}
                />

                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/students" element={<Students />} />
                <Route path="/admin/courses" element={<Courses />} />
                <Route
                    path="/admin/preferences"
                    element={<Preferences />}
                />
                <Route
                    path="/admin/allocation"
                    element={<Allocation />}
                />
                <Route
                    path="/admin/simulation"
                    element={<Simulation />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;