# Instalar Dependencias necessarias para as nossas ferramentas React

    npm add axios dayjs jwt-decode react-router-dom@5.2.0
    npm start

>   #   Para o Login criar os arquivos abaixo dentro da pasta src:

    mkdir services;
    mkdir services/net;
    mkdir services/net/base;
    mkdir services/guards;
    mkdir components;
    mkdir components/users;
    mkdir components/pages;
    mkdir components/partials;
    touch components/users/Login.js;
    touch components/users/Register.js;
    touch components/pages/Home.js;
    touch components/pages/Protected.js;
    touch components/partials/NavigationMenu.js;
    touch components/partials/Footer.js;
    touch components/partials/UserInfo.js;
    touch services/net/base/AxiosService.js;
    touch services/guards/PrivateRoute.js;
    touch services/net/AxiosUsersService.js;


>   #   Dentro da pasta src ficarao estruturados da seguinte forma:

    .
    ├── App.js
    ├── components
    │   ├── pages
    │   │   ├── Home.js
    │   │   └── Protected.js
    │   ├── partials
    │   │   ├── Footer.js
    │   │   ├── NavigationMenu.js
    │   │   └── UserInfo.js
    │   └── users
    │       ├── Login.js
    │       └── Register.js
    ├── index.css
    ├── index.js
    └── services
        ├── guards
        │   └── PrivateRoute.js
        └── net
            ├── AxiosUsersService.js
            └── base
                └── AxiosService.js

>   #   `services/net/AxiosUsersService.js`

    import { createContext, useState, useEffect } from "react";
    import jwt_decode from "jwt-decode";
    import { useHistory } from "react-router-dom";

    const AxiosUsersService = createContext();

    export default AxiosUsersService;

    export const AuthProvider = ({ children }) => {
        const [authTokens, setAuthTokens] = useState(() =>
            localStorage.getItem("authTokens")
            ? JSON.parse(localStorage.getItem("authTokens"))
            : null
        );
        const [user, setUser] = useState(() =>
            localStorage.getItem("authTokens")
            ? jwt_decode(localStorage.getItem("authTokens"))
            : null
        );
        const [loading, setLoading] = useState(true);

        const history = useHistory();

        const loginUser = async (username, password) => {
            const response = await fetch("http://127.0.0.1:8000/api/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
            });
            const data = await response.json();

            if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwt_decode(data.access));
            localStorage.setItem("authTokens", JSON.stringify(data));
            history.push("/");
            } else {
            alert("Something went wrong!");
            }
        };

        const registerUser = async (username, password, password2) => {
            const response = await fetch("http://127.0.0.1:8000/api/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
                password2
            })
            });
            if (response.status === 201) {
            history.push("/login");
            } else {
            alert("Something went wrong!");
            }
        };

        const logoutUser = () => {
            setAuthTokens(null);
            setUser(null);
            localStorage.removeItem("authTokens");
            history.push("/");
        };

        const contextData = {
            user,
            setUser,
            authTokens,
            setAuthTokens,
            registerUser,
            loginUser,
            logoutUser
        };

        useEffect(() => {
            if (authTokens) {
            setUser(jwt_decode(authTokens.access));
            }
            setLoading(false);
        }, [authTokens, loading]);

        return (
            <AxiosUsersService.Provider value={contextData}>
            {loading ? null : children}
            </AxiosUsersService.Provider>
        );
    };


>   #   `services/net/base/AxiosService.js`

    import axios from "axios";
    import jwt_decode from "jwt-decode";
    import dayjs from "dayjs";
    import { useContext } from "react";
    import AuthContext from "../context/AuthContext";

    const baseURL = "http://127.0.0.1:8000/api";

    const useAxios = () => {
    const { authTokens, setUser, setAuthTokens } = useContext(AuthContext);

    const axiosInstance = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${authTokens?.access}` }
    });

    axiosInstance.interceptors.request.use(async req => {
        const user = jwt_decode(authTokens.access);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (!isExpired) return req;

        const response = await axios.post(`${baseURL}/token/refresh/`, {
        refresh: authTokens.refresh
        });

        localStorage.setItem("authTokens", JSON.stringify(response.data));

        setAuthTokens(response.data);
        setUser(jwt_decode(response.data.access));

        req.headers.Authorization = `Bearer ${response.data.access}`;
        return req;
    });

    return axiosInstance;
    };

    export default useAxios;


>   #   `services/guards/PrivateRoute.js`

    import { Route, Redirect } from "react-router-dom";
    import { useContext } from "react";
    import AuthContext from "../context/AuthContext";

    const PrivateRoute = ({ children, ...rest }) => {
        let { user } = useContext(AuthContext);
        return <Route {...rest}>{!user ? <Redirect to="/login" /> : children}</Route>;
    };

    export default PrivateRoute;


>   #   `App.js`

    import React from "react";
    import "./index.css";
    import Footer from "./components/Footer";
    import Navbar from "./components/Navbar";
    import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
    import PrivateRoute from "./utils/PrivateRoute";
    import { AuthProvider } from "./context/AuthContext";
    import Home from "./views/homePage";
    import Login from "./views/loginPage";
    import Register from "./views/registerPage";
    import ProtectedPage from "./views/ProtectedPage";

    function App() {
        return (
        <Router>
            <div className="flex flex-col min-h-screen overflow-hidden">
            <AuthProvider>
                <Navbar />
                <Switch>
                <PrivateRoute component={ProtectedPage} path="/protected" exact />
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

>   #   `components/partials/Footer.js`

    const Footer = () => {
        return (
            <div>
            <h4>Created By You</h4>
            </div>
        );
    };

    export default Footer;

>   #   `components/partials/NavigationMenu.js`

    import { useContext } from "react";
    import { Link } from "react-router-dom";
    import AuthContext from "../context/AuthContext";

    const Navbar = () => {
        const { user, logoutUser } = useContext(AuthContext);
        return (
        <nav>
            <div>
            <h1>App Name</h1>
            <div>
                {user ? (
                <>
                    <Link to="/">Home</Link>
                    <Link to="/protected">Protected Page</Link>
                    <button onClick={logoutUser}>Logout</button>
                </>
                ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
                )}
            </div>
            </div>
        </nav>
        );
    };

    export default Navbar;

>   #   `components/partials/UserInfo.js`

    function UserInfo({ user }) {
        return (
            <div>
            <h1>Hello, {user.username}</h1>
            </div>
        );
    }

    export default UserInfo;

>   #   `components/pages/Protected.js`

    import { useEffect, useState } from "react";
    import useAxios from "../utils/useAxios";

    function ProtectedPage() {
    const [res, setRes] = useState("");
    const api = useAxios();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get("/test/");
                setRes(response.data.response);
            } catch {
                setRes("Something went wrong");
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

        return (
            <div>
                <h1>Projected Page</h1>
                <p>{res}</p>
            </div>
        );
    }

    export default ProtectedPage;

>   #   `components/pages/Home.js`

    import { useContext } from "react";
    import UserInfo from "../components/UserInfo";
    import AuthContext from "../context/AuthContext";

    const Home = () => {
    const { user } = useContext(AuthContext);
    return (
        <section>
        {user && <UserInfo user={user} />}
        <h1>You are on home page!</h1>
        </section>
    );
    };

    export default Home;


>   #   `components/users/Login.js;`

    import { useContext } from "react";
    import AuthContext from "../context/AuthContext";

    const LoginPage = () => {
        const { loginUser } = useContext(AuthContext);
        const handleSubmit = e => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            username.length > 0 && loginUser(username, password);
        };

        return (
            <section>
                <form onSubmit={handleSubmit}>
                    <h1>Login </h1>
                    <hr />
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" placeholder="Enter Username" />
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" placeholder="Enter Password" />
                    <button type="submit">Login</button>
                </form>
            </section>
        );
    };

    export default LoginPage;

>   #  `components/users/Register.js`

    import { useState, useContext } from "react";
    import AuthContext from "../context/AuthContext";

    function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const { registerUser } = useContext(AuthContext);

    const handleSubmit = async e => {
        e.preventDefault();
        registerUser(username, password, password2);
    };

    return (
        <section>
            <form onSubmit={handleSubmit}>
                <h1>Register</h1>
                <hr />
                <div>
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                </div>
                <div>
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                </div>
                <div>
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                    type="password"
                    id="confirm-password"
                    onChange={e => setPassword2(e.target.value)}
                    placeholder="Confirm Password"
                    required
                />
                <p>{password2 !== password ? "Passwords do not match" : ""}</p>
                </div>
                <button>Register</button>
            </form>
        </section>
    );
    }

    export default Register;



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
