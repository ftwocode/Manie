import React from "react";
import "./index.css";
import Footer from "./components/Footer";
import NavigationMenu from "./components/NavigationMenu";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import Home from "./views/homePage";
import Login from "./views/Login";
import Register from "./views/registerPage";
import Protected from "./views/Protected";

function App() {
    return (
    <Router>
        <div className="flex flex-col min-h-screen overflow-hidden">
        <AuthProvider>
            <NavigationMenu />
            <Switch>
            <PrivateRoute component={Protected} path="/protected" exact />
            <Route component={Login} path="/login" />
            <Route component={Register} path="/register" />
            <Route component={Home} path="/" />
            </Switch>
        </AuthProvider>
        <Footer />
        </div>
    </Router>
    );
}

export default App;